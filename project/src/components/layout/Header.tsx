import { useState } from 'react'
import { Search, Bell, Menu, X, Check, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const { profile } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 mr-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="text-base md:text-2xl font-bold text-slate-800 truncate max-w-[150px] xs:max-w-[200px] md:max-w-none">
            Welcome, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search health records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 md:w-64 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all duration-200"
            />
          </div>

          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
            >
              <Bell className="h-6 w-6 md:h-5 md:w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-teal-50/30">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 transition-colors hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 p-2 rounded-xl h-fit ${notif.type === 'appointment' ? 'bg-purple-100 text-purple-600' :
                                notif.type === 'prescription' ? 'bg-teal-100 text-teal-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm font-bold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium italic">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-widest"
                      >
                        <Check className="w-3 h-3" />
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
