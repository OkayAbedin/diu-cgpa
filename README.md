# DIU CGPA

A web-based application for Daffodil International University students to calculate and track their Cumulative Grade Point Average (CGPA).

## Features

- **Automatic CGPA Calculation**: Fetch and calculate your CGPA using your student ID
- **Manual CGPA Calculation**: Input courses manually to calculate expected CGPA
- **CGPA Visualization**: View your progress through interactive charts
- **PDF Export**: Save your academic transcript as a PDF
- **Advanced Options**: Configure advanced options for fetching CGPA data

## Project Structure

```
diu-cgpa/
├── assets/
│   ├── img/           # Images and icons
│   │   └── DIU-logo.png
│   └── styles/        # CSS stylesheets
│       └── main.css
├── js/
│   ├── components/    # UI components
│   │   ├── ResultCard.js
│   │   ├── SemesterList.js
│   │   └── StudentInfo.js
│   ├── utils/         # Utility functions
│   │   ├── helpers.js
│   │   └── Iterator.js
│   ├── api.js         # API integration
│   ├── calculator.js  # CGPA calculation logic
│   └── ui.js          # UI management
├── dist/              # Production build files
├── index.html         # Main entry point
└── package.json       # Project metadata
```

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. Enter your student ID to fetch your CGPA or use the manual calculator

## Dependencies

- Bootstrap 5.3.0
- Chart.js
- HTML2PDF.js

## License

MIT License