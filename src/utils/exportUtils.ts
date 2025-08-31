import type { VacationRequest, CalendarEvent, ExportData } from '../types';
import { format } from 'date-fns';

export const exportUtils = {
  // Export to JSON
  toJSON: (data: VacationRequest[] | CalendarEvent[], filename: string = 'vacation-data'): ExportData => {
    return {
      format: 'json',
      data,
      filename: `${filename}.json`
    };
  },

  // Export to CSV
  toCSV: (requests: VacationRequest[], filename: string = 'vacation-requests'): ExportData => {
    const headers = [
      'Employee Name',
      'Employee ID',
      'Start Date',
      'End Date',
      'Type',
      'Status',
      'Reason',
      'Approved By',
      'Created Date'
    ];

    const csvData = [
      headers.join(','),
      ...requests.map(request => [
        `"${request.employeeName}"`,
        request.employeeId,
        format(new Date(request.startDate), 'yyyy-MM-dd'),
        format(new Date(request.endDate), 'yyyy-MM-dd'),
        request.type,
        request.status,
        `"${request.reason || ''}"`,
        `"${request.approvedBy || ''}"`,
        format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    return {
      format: 'csv',
      data: csvData as any,
      filename: `${filename}.csv`
    };
  },

  // Export to iCal format
  toICal: (events: CalendarEvent[], filename: string = 'vacation-calendar'): ExportData => {
    const icalData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Team Vacation Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events.map(event => [
        'BEGIN:VEVENT',
        `UID:${event.id}@team-vacation-calendar`,
        `DTSTART:${format(event.start, 'yyyyMMdd')}`,
        `DTEND:${format(event.end, 'yyyyMMdd')}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.employeeName} - ${event.type} (${event.status})`,
        `STATUS:${event.status.toUpperCase()}`,
        'END:VEVENT'
      ].join('\n')),
      'END:VCALENDAR'
    ].join('\n');

    return {
      format: 'ical',
      data: icalData as any,
      filename: `${filename}.ics`
    };
  },

  // Export to Confluence table format
  toConfluence: (requests: VacationRequest[], filename: string = 'confluence-vacation-table'): ExportData => {
    const confluenceTable = [
      '|| Employee || Start Date || End Date || Type || Status || Duration ||',
      ...requests.map(request => {
        const duration = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return `| ${request.employeeName} | ${format(new Date(request.startDate), 'MMM dd, yyyy')} | ${format(new Date(request.endDate), 'MMM dd, yyyy')} | ${request.type} | ${request.status} | ${duration} days |`;
      })
    ].join('\n');

    return {
      format: 'confluence',
      data: confluenceTable as any,
      filename: `${filename}.txt`
    };
  },

  // Export to Jira table format
  toJira: (requests: VacationRequest[], filename: string = 'jira-vacation-table'): ExportData => {
    const jiraTable = [
      '||Employee||Start Date||End Date||Type||Status||Duration||',
      ...requests.map(request => {
        const duration = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return `|${request.employeeName}|${format(new Date(request.startDate), 'MMM dd, yyyy')}|${format(new Date(request.endDate), 'MMM dd, yyyy')}|${request.type}|${request.status}|${duration} days|`;
      })
    ].join('\n');

    return {
      format: 'jira',
      data: jiraTable as any,
      filename: `${filename}.txt`
    };
  },

  // Download file utility
  downloadFile: (exportData: ExportData) => {
    const blob = new Blob([typeof exportData.data === 'string' ? exportData.data : JSON.stringify(exportData.data, null, 2)], {
      type: getContentType(exportData.format)
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const getContentType = (format: string): string => {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'csv':
      return 'text/csv';
    case 'ical':
      return 'text/calendar';
    case 'confluence':
    case 'jira':
      return 'text/plain';
    default:
      return 'text/plain';
  }
};

// Confluence integration helpers
export const confluenceIntegration = {
  generateMacro: (calendarId: string = 'team-vacation-calendar') => {
    return `{calendar:${calendarId}}`;
  },

  generatePageContent: (requests: VacationRequest[], title: string = 'Team Vacation Calendar') => {
    const table = exportUtils.toConfluence(requests);
    return `
h1. ${title}

h2. Current Vacation Requests

${table.data}

h2. Calendar View

{calendar}

h2. Statistics

* Total Requests: ${requests.length}
* Approved: ${requests.filter(r => r.status === 'approved').length}
* Pending: ${requests.filter(r => r.status === 'pending').length}
* Rejected: ${requests.filter(r => r.status === 'rejected').length}

_Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}_
    `.trim();
  }
};

// Jira integration helpers
export const jiraIntegration = {
  generateIssueDescription: (request: VacationRequest) => {
    return `
h3. Vacation Request Details

||Field||Value||
|Employee|${request.employeeName}|
|Start Date|${format(new Date(request.startDate), 'MMM dd, yyyy')}|
|End Date|${format(new Date(request.endDate), 'MMM dd, yyyy')}|
|Type|${request.type}|
|Duration|${Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days|
|Reason|${request.reason || 'Not specified'}|

h3. Actions Required
- [ ] Review request details
- [ ] Check team coverage
- [ ] Approve or reject request
- [ ] Update vacation calendar
    `.trim();
  },

  generateTeamReport: (requests: VacationRequest[], teamName: string = 'Team') => {
    const table = exportUtils.toJira(requests);
    return `
h2. ${teamName} Vacation Schedule

${table.data}

h3. Summary
* Total vacation days: ${requests.reduce((sum, r) => sum + Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1, 0)}
* Active requests: ${requests.filter(r => r.status === 'approved').length}
* Pending approvals: ${requests.filter(r => r.status === 'pending').length}

h3. Upcoming Vacations
${requests
  .filter(r => new Date(r.startDate) > new Date() && r.status === 'approved')
  .slice(0, 5)
  .map(r => `* ${r.employeeName}: ${format(new Date(r.startDate), 'MMM dd')} - ${format(new Date(r.endDate), 'MMM dd')}`)
  .join('\n')}
    `.trim();
  }
};