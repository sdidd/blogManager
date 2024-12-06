import React, { useState, useEffect } from 'react';
import API from '../../api';

const HolidaysComponent = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedHoliday, setSelectedHoliday] = useState(null); // State to store selected holiday
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const getHolidays = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/dashboard/holidays');
      const holidays = res.data.holidays;
      setHolidays(holidays);
      generateCalendar(holidays); // Re-generate calendar after fetching holidays
    } catch (err) {
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate the calendar for the current month
  const generateCalendar = (holidays) => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const firstDay = startOfMonth.getDay();
    
    let days = [];
    let holidayDates = holidays.map((holiday) => new Date(holiday.date.iso).getDate());

    // Fill the calendar grid with the correct dates
    for (let i = 0; i < firstDay; i++) {
      days.push(null); // Empty cells before the first day
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Create a 2D grid for the calendar (weeks)
    const weeks = [];
    let week = [];
    days.forEach((day, index) => {
      if (week.length < 7) {
        week.push(day);
      } else {
        weeks.push(week);
        week = [day];
      }
    });
    if (week.length) {
      weeks.push(week);
    }

    // Mark holidays
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (holidayDates.includes(day)) {
          weeks[weekIndex][dayIndex] = { day, isHoliday: true };
        } else if (day) {
          weeks[weekIndex][dayIndex] = { day, isHoliday: false };
        }
      });
    });

    setCalendar(weeks);
  };

  // Function to handle clicking a day
  const handleDayClick = (day) => {
    const holiday = holidays.find((holiday) => new Date(holiday.date.iso).getDate() === day);
    if (holiday) {
      setSelectedHoliday(holiday);
      setShowModal(true); // Show the modal
    }
  };

  useEffect(() => {
    getHolidays();
  }, [currentMonth, currentYear]);

  return (
    <div className="card holidays-card p-3 shadow">
      <div className="card-body">
        <h5 className="card-title">Public Holidays</h5>
        <button className="btn btn-primary mb-3" onClick={getHolidays}>
          Get Holidays
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="calendar">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  className="btn btn-link"
                  onClick={() => setCurrentMonth(currentMonth - 1)}
                >
                  &lt;
                </button>
                <span className="font-weight-bold">
                  {new Date(currentYear, currentMonth).toLocaleString('default', {
                    month: 'long',
                  })}
                </span>
                <button
                  className="btn btn-link"
                  onClick={() => setCurrentMonth(currentMonth + 1)}
                >
                  &gt;
                </button>
              </div>

              <div className="calendar-grid row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={index} className="col text-center font-weight-bold">
                    {day}
                  </div>
                ))}
                {calendar.map((week, index) => (
                  <div key={index} className="row">
                    {week.map((day, idx) => (
                      <div
                        key={idx}
                        className={`col text-center p-2 ${
                          day ? (day.isHoliday ? 'bg-warning' : 'bg-light') : 'bg-transparent'
                        }`}
                        onClick={() => day && handleDayClick(day.day)} // Add click handler to each day
                      >
                        {day ? day.day : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for displaying holiday details */}
      {selectedHoliday && (
        <div
          className={`modal fade ${showModal ? 'show' : ''}`}
          tabIndex="-1"
          style={{ display: showModal ? 'block' : 'none' }}
          aria-labelledby="holidayModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="holidayModalLabel">
                  {selectedHoliday.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>{selectedHoliday.description}</p>
                <a
                  href={selectedHoliday.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  More Info
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidaysComponent;
