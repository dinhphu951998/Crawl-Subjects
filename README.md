# Crawl Subjects

A JavaScript script to crawl and extract subject information from HCMUT (Ho Chi Minh University of Technology) course registration system.

## Features

- **Crawl Subject Data**: Automatically fetches subject details including code, name, credits, groups, schedules, teachers, and more
- **Local Storage**: Saves crawled data to browser's localStorage for offline access
- **Batch Processing**: Supports processing subjects in batches with configurable batch sizes
- **Parallel Processing**: Processes multiple batches concurrently for faster crawling
- **Filtering**: Filter subjects by group code (e.g., "im01" for important subjects)
- **Skip Existing**: Automatically skips subjects that already have data (unless force update is enabled)

## How to Use

### Prerequisites

1. Open the HCMUT course registration page in your browser
2. Open the browser's Developer Console (F12 or Right-click → Inspect → Console)
3. Ensure jQuery is available on the page (the script uses `$`)
4. You must search (load) all subjects so that they are visible on the page

### Basic Usage

1. **Copy the script**: Copy the contents of `crawlSubjects.js`

2. **Paste in console**: Paste the script into the browser console and press Enter

3. **Start crawling**: The script will automatically start crawling all subjects on the page

### Advanced Usage

You can customize the crawling behavior by calling `startCrawling()` with options:

```javascript
startCrawling({
    waitTime: 1,        // Wait time between requests (seconds)
    batchSize: 50,      // Number of subjects per batch
    forceUpdate: false, // Force update existing subjects
    count: 100          // Limit number of subjects to crawl
});
```

**Parameters:**
- `waitTime` (default: 2): Delay between API requests in seconds
- `batchSize` (default: 400): Number of subjects processed per batch
- `forceUpdate` (default: false): If true, re-crawls subjects even if data exists
- `count` (optional): Limit the total number of subjects to crawl

### Filter Important Subjects

To get subjects filtered by a specific group code (e.g., "im01"):

```javascript
const impSubjects = getImpSubjects("im01");
console.log(impSubjects);
```

This function:
- Reads all subjects from localStorage
- Filters subjects that have the specified group code
- Returns sorted array with subject code, name, credit, and group details

## Functions

### `startCrawling(options)`
Main function to start crawling subjects. Processes subjects in batches and saves data to localStorage.

### `crawlSubjects(subjects, waitTime, batchIndex, forceUpdate)`
Crawls a batch of subjects and saves their details to localStorage.

### `getSubjectTable(subject, id, waitTime)`
Fetches and parses subject table data from the API.

### `getImpSubjects(impCode)`
Retrieves and filters subjects by group code from localStorage.

### `saveToLocalStorage(id, data)`
Saves subject data to browser's localStorage with key format: `subjectData_{id}`

### `isValidToCrawl(id)`
Checks if a subject needs to be crawled (returns true if no data exists or data is empty).

## Data Structure

Each subject is stored with the following structure:

```javascript
{
    code: "CS101",
    name: "Introduction to Computer Science",
    credit: "3",
    subjectDetails: [
        {
            group: "01",
            size: "50",
            language: "Vietnamese",
            teacher: "Dr. John Doe",
            dayOfWeek: "Monday",
            slot: "1-3",
            room: "A101",
            branch: "Main Campus",
            weeks: "1-15"
        }
    ]
}
```

## Notes

- The script makes API calls to `https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action`
- Data is stored in browser's localStorage, so it persists across page refreshes
- Make sure you're logged into the HCMUT system before running the script
- Adjust `waitTime` to avoid overwhelming the server with too many requests

## Example

```javascript
// Crawl first 100 subjects with 1 second delay
startCrawling({ 
    waitTime: 1, 
    batchSize: 50, 
    count: 100 
});

// After crawling, get important subjects
const importantSubjects = getImpSubjects("im01");
console.log(`Found ${importantSubjects.length} important subjects`);
```

