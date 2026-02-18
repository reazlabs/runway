// App.jsx
import { useState } from 'react';

function Apppp() {
  // ডেমো ডাটা (তুমি এখানে তোমার API / state থেকে আনতে পারো)
  const [passports] = useState([
    {
      sl: 1,
      name: "Md. Rahim Khan",
      passportNo: "AB1234567",
      receivedDate: "15 Jan, 2025",
      agent: "Sumon Mia",
    },
    {
      sl: 2,
      name: "Fatima Begum",
      passportNo: "BM9876543",
      receivedDate: "22 Feb, 2025",
      agent: "Rashedul Islam",
    },
    {
      sl: 3,
      name: "Sadia Akter",
      passportNo: "CD4567890",
      receivedDate: "10 Mar, 2025",
      agent: "Jahid Hasan",
    },
    {
      sl: 4,
      name: "Karim Hossain",
      passportNo: "EF1122334",
      receivedDate: "05 Apr, 2025",
      agent: "Nargis Akter",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Passport Tracking</h1>
          <p className="mt-2 text-lg text-gray-600">
            Received passports list
          </p>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    SL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Passport Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Passport No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Received Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Agent
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {passports.map((item) => (
                  <tr
                    key={item.sl}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                      {item.sl.toString().padStart(2, '0')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {item.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-700">
                      {item.passportNo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {item.receivedDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {item.agent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state (যদি কোনো ডাটা না থাকে) */}
          {passports.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No passports received yet.
            </div>
          )}
        </div>

        {/* Footer info (optional) */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default Apppp;