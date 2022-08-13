const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const Job = require("../models/job-model");

exports.getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userID });
  res.status(StatusCodes.OK).json({ count: jobs.length, jobs });
};

exports.getJob = async (req, res) => {
  // Find job related to Job ID and User ID
  // req.params.id === Job ID, req.user.userID === User ID
  const job = await Job.findOne({ _id: req.params.id, createdBy: req.user.userID });
  if (!job) throw new NotFoundError(`No job with ID: ${req.params.id}`);

  res.status(StatusCodes.OK).json({ job });
};

exports.createJob = async (req, res) => {
  req.body.createdBy = req.user.userID;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

exports.updateJob = async (req, res) => {
  // Destructuring data from req,
  const {
    params: { id: jobID },
    user: { userID },
    body: { company, position },
  } = req;

  if (!company || !position) throw new BadRequestError("Company or Position cannot be empty");

  const job = await Job.findOneAndUpdate({ _id: jobID, createdBy: userID }, req.body, { new: true, runValidators: true });
  if (!job) throw new NotFoundError(`No job with ID: ${jobID}`);

  res.status(StatusCodes.OK).json({ job });
};

exports.deleteJob = async (req, res) => {
  const {
    params: { id: jobID },
    user: { userID },
  } = req;

  const job = await Job.findOneAndRemove({ _id: jobID, createdBy: userID });
  if (!job) throw new NotFoundError(`No job with ID: ${jobID}`);

  res.status(StatusCodes.OK).json({});
};
