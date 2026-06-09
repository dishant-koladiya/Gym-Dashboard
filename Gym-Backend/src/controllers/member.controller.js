const memberService = require("../services/member.service");
const { sendSuccess } = require("../utils/response");

/**
 * Controller to create a new member.
 */
const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body);
    return sendSuccess(res, "Member created successfully.", member, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to list members with pagination/filters.
 */
const getMembers = async (req, res, next) => {
  try {
    const result = await memberService.getMembers(req.query);
    return sendSuccess(res, "Members list retrieved successfully.", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get detailed member profile.
 */
const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    return sendSuccess(res, "Member details retrieved successfully.", member, 200);
  } catch (error) {
    next(error);
  }
};

/** Get only ACTIVE members */
const getActiveMembers = async (req, res, next) => {
  try {
    const members = await memberService.getActiveMembers();
    return sendSuccess(res, "Active members retrieved.", members, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update member properties.
 */
const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body);
    return sendSuccess(res, "Member updated successfully.", member, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to deactivate a member's account.
 */
const deactivateMember = async (req, res, next) => {
  try {
    const member = await memberService.deactivateMember(req.params.id);
    return sendSuccess(res, "Member deactivated successfully.", member, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to log a member's attendance check-in.
 */
const checkIn = async (req, res, next) => {
  try {
    const attendance = await memberService.checkIn(req.params.id);
    return sendSuccess(res, "Check-in recorded successfully.", attendance, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to log a member's attendance check-out.
 */
const checkOut = async (req, res, next) => {
  try {
    const attendance = await memberService.checkOut(req.params.id);
    return sendSuccess(res, "Check-out recorded successfully.", attendance, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete all members.
 */
const deleteAllMembers = async (req, res, next) => {
  try {
    const result = await memberService.deleteAllMembers();
    return sendSuccess(res, `All ${result.count} members deleted permanently.`, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to permanently delete a member.
 */
const deleteMember = async (req, res, next) => {
  try {
    const member = await memberService.deleteMember(req.params.id);
    return sendSuccess(res, "Member deleted permanently.", member, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deactivateMember,
  deleteMember,
  deleteAllMembers,
  getActiveMembers,
  checkIn,
  checkOut,
};
