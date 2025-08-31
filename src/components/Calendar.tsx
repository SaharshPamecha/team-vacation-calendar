import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarView, FilterOptions } from '../types';
import { dateUtils, vacationUtils } from '../utils/dateUtils';
import styles from '../styles/Calendar.module.css';

interface CalendarProps {
  events: CalendarEvent[];
  filters: FilterOptions;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  filters,
  onDateClick,
  onEventClick
}) => {
  const [view, setView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date()
  });

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.employee && event.employeeId !== filters.employee) {
        return false;
      }
      if (filters.status && event.status !== filters.status) {
        return false;
      }
      if (filters.type && event.type !== filters.type) {
        return false;
      }
      if (filters.dateRange) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const filterStart = filters.dateRange.start;
        const filterEnd = filters.dateRange.end;
        
        const overlaps = eventStart <= filterEnd && eventEnd >= filterStart;
        if (!overlaps) {
          return false;
        }
      }
      return true;
    });
  }, [events, filters]);

  const handleNavigation = (direction: 'prev' | 'next') => {
    setView(prevView => ({
      ...prevView,
      currentDate: view.type === 'month' 
        ? dateUtils.navigateMonth(prevView.currentDate, direction)
        : dateUtils.navigateWeek(prevView.currentDate, direction)
    }));
  };

  const handleViewChange = (newViewType: 'month' | 'week' | 'year') => {
    setView(prevView => ({
      ...prevView,
      type: newViewType
    }));
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick?.(event);
  };

  const renderMonthView = () => {
    const days = dateUtils.getMonthDays(view.currentDate);
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className={styles.calendarGrid}>
        {dayHeaders.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const dayEvents = vacationUtils.getEventsForDate(filteredEvents, date);
          const isCurrentMonth = dateUtils.isCurrentMonth(date, view.currentDate);
          const isToday = dateUtils.isToday(date);
          const isWeekend = dateUtils.isWeekend(date);

          return (
            <div
              key={index}
              className={`${styles.dayCell} ${
                !isCurrentMonth ? styles.otherMonth : ''
              } ${isToday ? styles.today : ''} ${
                isWeekend ? styles.weekend : ''
              }`}
              onClick={() => handleDateClick(date)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDateClick(date);
                }
              }}
            >
              <div className={styles.dayNumber}>
                {format(date, 'd')}
              </div>
              <div className={styles.vacationEvents}>
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`${styles.vacationEvent} ${styles[event.status]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    title={`${event.employeeName} - ${event.type} (${event.status})`}
                  >
                    {event.employeeName}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className={styles.moreEvents}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = dateUtils.getWeekDays(view.currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className={styles.weekView}>
        <div className={styles.weekHeader}>
          <div className={styles.timeColumn}></div>
          {weekDays.map(day => {
            const isToday = dateUtils.isToday(day);
            return (
              <div
                key={day.toString()}
                className={`${styles.weekDayHeader} ${isToday ? styles.today : ''}`}
              >
                <div>{format(day, 'EEE')}</div>
                <div>{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.weekGrid}>
          {hours.map(hour => (
            <div key={hour} className={styles.hourRow}>
              <div className={styles.hourLabel}>
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              {weekDays.map(day => {
                const dayEvents = vacationUtils.getEventsForDate(filteredEvents, day);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={styles.weekDayColumn}
                    onClick={() => handleDateClick(day)}
                  >
                    {hour === 0 && dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`${styles.vacationEvent} ${styles[event.status]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          right: '4px',
                          zIndex: 1
                        }}
                      >
                        {event.employeeName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <div className={styles.calendarNav}>
          <button
            className={styles.navButton}
            onClick={() => handleNavigation('prev')}
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className={styles.navButton}
            onClick={() => handleNavigation('next')}
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        <h2 className={styles.calendarTitle}>
          {view.type === 'month' 
            ? format(view.currentDate, 'MMMM yyyy')
            : view.type === 'week'
            ? `Week of ${format(view.currentDate, 'MMM d, yyyy')}`
            : format(view.currentDate, 'yyyy')
          }
        </h2>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${view.type === 'month' ? styles.active : ''}`}
            onClick={() => handleViewChange('month')}
          >
            Month
          </button>
          <button
            className={`${styles.viewButton} ${view.type === 'week' ? styles.active : ''}`}
            onClick={() => handleViewChange('week')}
          >
            Week
          </button>
        </div>
      </div>

      {view.type === 'month' && renderMonthView()}
      {view.type === 'week' && renderWeekView()}
    </div>
  );
};