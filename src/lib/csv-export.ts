import type { Semester, Course } from './types';

// Function to convert data to CSV format
function convertToCSV(data: any[]): string {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(value => {
            const strValue = String(value);
            // Escape commas and quotes
            if (strValue.includes(',') || strValue.includes('"')) {
                return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        }).join(',')
    );
    return [header, ...rows].join('\n');
}

// Function to trigger CSV download
export function downloadSemestersAsCSV(semesters: Semester[]): void {
    if (semesters.length === 0) {
        return;
    }

    const flattenedData = semesters.flatMap(semester => 
        semester.courses.map(course => ({
            semesterName: semester.name,
            courseName: course.name,
            courseUnits: course.units,
            courseGrade: course.grade,
        }))
    );
    
    if (flattenedData.length === 0) {
        // Handle case where there are semesters but no courses
        const headers = ['semesterName', 'courseName', 'courseUnits', 'courseGrade'];
        const csvContent = headers.join(',');
        triggerDownload(csvContent);
        return;
    }

    const csvContent = convertToCSV(flattenedData);
    triggerDownload(csvContent);
}

function triggerDownload(csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'GradeRight_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
