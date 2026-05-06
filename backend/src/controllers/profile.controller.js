const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: {
        education: true,
        qualifications: true,
        user: {
          select: {
            username: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            referralCode: true,
            createdAt: true,
          }
        }
      }
    })
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found. Please complete your profile.'
      })
    }
    res.status(200).json({ status: 'success', data: { profile } })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get profile.' })
  }
}

const upsertProfile = async (req, res) => {
  try {
    const {
      firstName, lastName, idNumber, passportNumber,
      dateOfBirth, gender, address, city, province,
      country, bio, skills, experience, hasDriversLicense
    } = req.body
    if (!firstName || !lastName) {
      return res.status(400).json({ status: 'error', message: 'First name and last name are required.' })
    }
    if (!idNumber && !passportNumber) {
      return res.status(400).json({ status: 'error', message: 'ID number or passport number is required.' })
    }
    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {
        firstName, lastName, idNumber, passportNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender, address, city, province,
        country: country || 'South Africa',
        bio, skills: skills || [],
        experience,
        hasDriversLicense: hasDriversLicense || false,
      },
      create: {
        userId: req.user.id,
        firstName, lastName, idNumber, passportNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender, address, city, province,
        country: country || 'South Africa',
        bio, skills: skills || [],
        experience,
        hasDriversLicense: hasDriversLicense || false,
      }
    })
    res.status(200).json({ status: 'success', message: 'Profile saved!', data: { profile } })
  } catch (error) {
    console.error('Upsert profile error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to save profile.' })
  }
}

const addEducation = async (req, res) => {
  try {
    const { institution, qualification, fieldOfStudy, startYear, endYear, isCompleted } = req.body
    if (!institution || !qualification || !startYear) {
      return res.status(400).json({ status: 'error', message: 'Institution, qualification and start year are required.' })
    }
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } })
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Please complete your profile first.' })
    }
    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        institution, qualification, fieldOfStudy,
        startYear: parseInt(startYear),
        endYear: endYear ? parseInt(endYear) : null,
        isCompleted: isCompleted || false,
      }
    })
    res.status(201).json({ status: 'success', message: 'Education added!', data: { education } })
  } catch (error) {
    console.error('Add education error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to add education.' })
  }
}

const addQualification = async (req, res) => {
  try {
    const { name, issuedBy, issueDate } = req.body
    if (!name || !issuedBy) {
      return res.status(400).json({ status: 'error', message: 'Qualification name and issuing body are required.' })
    }
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } })
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Please complete your profile first.' })
    }
    const qualification = await prisma.qualification.create({
      data: {
        profileId: profile.id,
        name, issuedBy,
        issueDate: issueDate ? new Date(issueDate) : null,
      }
    })
    res.status(201).json({ status: 'success', message: 'Qualification added!', data: { qualification } })
  } catch (error) {
    console.error('Add qualification error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to add qualification.' })
  }
}

const submitDeclaration = async (req, res) => {
  try {
    const { hasCriminalRecord, hasPendingCases, offenceTypes, details } = req.body
    if (hasCriminalRecord === undefined || hasPendingCases === undefined) {
      return res.status(400).json({ status: 'error', message: 'Please answer all declaration questions.' })
    }
    const existing = await prisma.criminalDeclaration.findUnique({ where: { userId: req.user.id } })
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Declaration already submitted.' })
    }
    const declaration = await prisma.criminalDeclaration.create({
      data: {
        userId: req.user.id,
        hasCriminalRecord,
        hasPendingCases,
        offenceTypes: offenceTypes || [],
        details,
        declarationSigned: true,
      }
    })
    res.status(201).json({ status: 'success', message: 'Declaration submitted!', data: { declaration } })
  } catch (error) {
    console.error('Submit declaration error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to submit declaration.' })
  }
}

const getProfileStrength = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { education: true, qualifications: true }
    })
    const declaration = await prisma.criminalDeclaration.findUnique({ where: { userId: req.user.id } })
    let score = 0
    const items = []
    if (profile) {
      if (profile.firstName && profile.lastName) { score += 10; items.push({ label: 'Full name', done: true }) }
      else items.push({ label: 'Full name', done: false })
      if (profile.idNumber || profile.passportNumber) { score += 15; items.push({ label: 'ID / Passport number', done: true }) }
      else items.push({ label: 'ID / Passport number', done: false })
      if (profile.idDocumentUrl) { score += 15; items.push({ label: 'ID document uploaded', done: true }) }
      else items.push({ label: 'ID document uploaded', done: false })
      if (profile.profilePhoto) { score += 10; items.push({ label: 'Profile photo', done: true }) }
      else items.push({ label: 'Profile photo', done: false })
      if (profile.skills && profile.skills.length > 0) { score += 10; items.push({ label: 'Skills added', done: true }) }
      else items.push({ label: 'Skills added', done: false })
      if (profile.bio) { score += 5; items.push({ label: 'Bio added', done: true }) }
      else items.push({ label: 'Bio added', done: false })
      if (profile.education.length > 0) { score += 15; items.push({ label: 'Education added', done: true }) }
      else items.push({ label: 'Education added', done: false })
      if (profile.qualifications.length > 0) { score += 10; items.push({ label: 'Qualification uploaded', done: true }) }
      else items.push({ label: 'Qualification uploaded', done: false })
    } else {
      ['Full name','ID / Passport number','ID document uploaded','Profile photo',
       'Skills added','Bio added','Education added','Qualification uploaded']
      .forEach(label => items.push({ label, done: false }))
    }
    if (declaration) { score += 10; items.push({ label: 'Criminal declaration signed', done: true }) }
    else items.push({ label: 'Criminal declaration signed', done: false })
    res.status(200).json({
      status: 'success',
      data: {
        score,
        items,
        message: score === 100 ? 'Your profile is complete! 🎉' : 'Complete your profile to increase your chances of getting hired.'
      }
    })
  } catch (error) {
    console.error('Profile strength error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get profile strength.' })
  }
}

module.exports = { getMyProfile, upsertProfile, addEducation, addQualification, submitDeclaration, getProfileStrength }
