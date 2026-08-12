import FrameworkDepartmentDetails from "./complianceAssignmentDepartmentDetails";


const Dashboard = () => {

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2B245C]">
           Department Details
        </h1>
      </div>
      <FrameworkDepartmentDetails />
    </div>
  );
};

export default Dashboard;
