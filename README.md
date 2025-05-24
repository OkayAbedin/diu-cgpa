# DIU CGPA

A modern web application designed specifically for Daffodil International University students to track, calculate, and analyze their academic performance.

![DIU CGPA Logo](assets/img/diu-cgpa-logo.svg)

## 🚀 Features

- **Automatic CGPA Calculation**: Fetch your complete academic record using just your student ID
- **Manual CGPA Calculator**: Plan future semesters by adding hypothetical courses with custom grades
- **Advanced Fetch Options**: Use batch processing for multiple student IDs or ID ranges with configurable timeout settings
- **Academic Transcript**: Generate and save professional PDF transcripts of your results
- **Data Export**: Export your results to CSV format for further analysis
- **Interactive Visualization**: Track your semester-by-semester progress with dynamic charts showing both semester and cumulative GPAs
- **Visual GPA Indicator**: Color-coded circular GPA display that changes based on performance level
- **Dark Mode Support**: Comfortable viewing experience in any lighting condition
- **Mobile-Friendly Design**: Fully responsive interface works on all devices

## 📋 Project Structure

```
diu-cgpa/
├── assets/
│   ├── img/           # Images and icons
│   │   ├── diu-cgpa-logo.svg
│   │   └── diu-logo.svg
│   └── styles/        # CSS stylesheets
│       ├── main.css
│       └── manual-calculator.css
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
│   ├── navigation.js  # Tab navigation
│   └── ui.js          # UI management
├── netlify/           # Serverless functions
│   └── functions/
│       ├── api-proxy.js
│       └── package.json
├── index.html         # Main entry point
├── netlify.toml       # Netlify deployment config
└── package.json       # Project metadata
```

## 🔧 Getting Started

1. Clone this repository
   ```
   git clone https://github.com/okayabedin/diu-cgpa.git
   cd diu-cgpa
   ```

2. Open `index.html` in your browser or use a local server
   ```
   npx serve
   ```

3. Enter your student ID to fetch your CGPA or use the manual calculator

## 💻 How It Works

This tool communicates with DIU's academic database through a secure API and processes the raw data to provide you with a clean, understandable representation of your academic performance. All calculations follow [DIU's official grading policy](https://daffodilvarsity.edu.bd/article/rules-and-regulation), with grades ranging from A+ (4.00) to F (0.00).

### CGPA Calculation Process

The application implements a weighted average calculation for CGPA:
- Each course's grade point (0.00 to 4.00) is multiplied by its credit hours
- These weighted values are summed up across all courses
- For retaken courses, only the best grade is considered in the CGPA calculation
- Courses with grades 'F' or 'I' (Incomplete) are included in GPA calculation but are not shown in total credit count display
- Retaken courses are marked with a retake indicator to show academic progress
- The total is divided by the total credit hours to get the CGPA
- Results are formatted to two decimal places

## 🔒 Privacy & Security

Your privacy matters to us. This application:
- Does not store your student ID or academic records on any server
- Processes all data locally in your browser
- Does not use cookies to track your activity
- Makes direct API calls to the university system with no third-party intermediaries
- Provides configurable response timeout options to handle server delays

## 🛠 Development

### Technologies Used

- **Vanilla JavaScript**: For core functionality and DOM manipulation
- **Chart.js**: For interactive data visualization
- **Bootstrap 5**: For responsive layouts and UI components
- **HTML2PDF.js**: For PDF transcript generation
- **FontAwesome**: For icons and visual elements
- **Netlify**: For hosting and serverless functions to handle CORS issues

### Key Features Implementation

- **Dynamic Charts**: Semester and cumulative GPA tracking with responsive charts
- **Custom Grading**: Support for DIU's grading system with custom grade input option
- **Batch Processing**: Multiple student IDs can be processed in sequence with progress tracking
- **Responsive Design**: Optimized layout for desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive handling of API timeouts and network issues

### Deployment

The project is configured for deployment on Netlify with serverless functions for API proxying to handle CORS issues.

## 📄 License

MIT License

## 🙏 About

- Made with ❤️ by [Minhaz](https://bio.link/minhazabedin)
- Version 2.0.0 | Last Updated: May 2025

---

### 🔗 Links
- [GitHub Repository](https://github.com/okayabedin/diu-cgpa)
- [Live Demo](https://diucgpa.netlify.app)
