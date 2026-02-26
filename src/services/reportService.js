import { reportModel } from "~/models/reportModel";

const createReport = async (data) => {
  try {
    const newReport = await reportModel.createReport(data);
    return newReport;
  } catch (error) {
    throw error;
  }
};
const getAllReports = async (queryData) => {
  try {
    return await reportModel.getAllReports(queryData);
  } catch (error) {
    throw error;
  }
};

const getReportStats = async () => {
  try {
    return await reportModel.getReportStats();
  } catch (error) {
    throw error;
  }
};
export const reportService = {
  createReport,
  getAllReports,
  getReportStats,
};
