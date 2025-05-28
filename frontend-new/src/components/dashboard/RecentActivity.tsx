import { ReactNode } from 'react';

interface Activity {
  id: string;
  title: string;
  time: string;
  description: string;
  icon: ReactNode;
  iconBackground: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500">Latest updates and notifications</p>
      </div>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div className={`relative px-1 ${activity.iconBackground}`}>
                      <div className="h-8 w-8 flex items-center justify-center rounded-full ring-8 ring-white">
                        {activity.icon}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {activity.title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      {activity.description}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <button
          type="button"
          className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          View all
        </button>
      </div>
    </div>
  );
};

export default RecentActivity; 