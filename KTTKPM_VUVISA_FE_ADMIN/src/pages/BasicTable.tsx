import React from "react";

interface TableRow {
  id: number;
  name: string;
  role: string;
  project: string;
  team: string[];
  status: "Active" | "Pending" | "Cancel";
  budget: string;
  avatar: string;
}

const tableData: TableRow[] = [
  {
    id: 1,
    name: "Lindsey Curtis",
    role: "Web Designer",
    project: "Agency Website",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Active",
    budget: "3.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 2,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 3,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 44,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 55,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 66,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 77,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 88,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 99,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
  {
    id: 10,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["https://free-demo.tailadmin.com/src/images/user/user-17.jpg", "https://free-demo.tailadmin.com/src/images/user/user-17.jpg"],
    status: "Pending",
    budget: "24.9K",
    avatar: "https://free-demo.tailadmin.com/src/images/user/user-17.jpg",
  },
];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancel: "bg-red-100 text-red-700",
};

const BasicTable: React.FC = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Basic Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-left">
              <th className="p-3 border">User</th>
              <th className="p-3 border">Project Name</th>
              <th className="p-3 border">Team</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Budget</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3 flex items-center space-x-3">
                  <img src={row.avatar} alt={row.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-sm text-gray-500">{row.role}</p>
                  </div>
                </td>
                <td className="p-3 text-gray-700">{row.project}</td>
                <td className="p-3 flex -space-x-2">
                  {row.team.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="team member"
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ))}
                </td>
                <td className="p-3">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="p-3 font-semibold">{row.budget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BasicTable;