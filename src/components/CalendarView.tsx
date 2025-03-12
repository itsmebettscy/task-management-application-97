      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-sm py-1 text-gray-700">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const taskCount = getTaskCountForDate(day);
          
          return (
            <div 
              key={index}
              onClick={() => setSelectedDate(new Date(day))}
              className={`
                p-2 h-12 text-center relative cursor-pointer rounded
                ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                ${isToday ? 'bg-blue-100' : ''}
                ${isSelected ? 'bg-blue-200' : ''}
                hover:bg-gray-100
              `}
            >
              <span className={`${isSelected ? 'font-bold' : ''}`}>
                {day.getDate()}
              </span>
              {taskCount > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                  {taskCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
  
  <div className="w-full md:w-2/3">
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {formatDate(selectedDate)}
      </h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {tasksForSelectedDay && tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map((task: Task) => (
              <motion.div
                key={task.id || `task-${Math.random().toString(36).substr(2, 9)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center text-gray-500"
            >
              No tasks for this date
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
</div>
