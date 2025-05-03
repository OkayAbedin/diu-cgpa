# DIU CGPA Calculator

A modern web application designed specifically for Daffodil International University students to track, calculate, and analyze their academic performance.

![DIU CGPA Logo](assets/img/diu-cgpa-logo.svg)

## 🚀 Features

- **Automatic CGPA Calculation**: Fetch your complete academic record using just your student ID
- **Manual CGPA Calculator**: Plan future semesters by adding hypothetical courses and grades
- **Advanced Fetch Options**: Use batch processing for multiple student IDs or ID ranges
- **Academic Transcript**: Generate and save professional PDF transcripts of your results
- **Data Visualization**: View your semester-by-semester progress with interactive charts
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

This tool communicates with DIU's academic database through a secure API and processes the raw data to provide you with a clean, understandable representation of your academic performance. All calculations follow DIU's official grading policy.

## 🔒 Privacy & Security

Your privacy matters to us. This application:
- Does not store your student ID or academic records on any server
- Processes all data locally in your browser
- Does not use cookies to track your activity
- Makes direct API calls to the university system with no third-party intermediaries

## 🛠 Development

### Dependencies

- Bootstrap 5.3.0
- Chart.js
- HTML2PDF.js
- Font Awesome

### Deployment

The project is configured for deployment on Netlify with serverless functions for API proxying to handle CORS issues.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Made with ❤️ by [Minhaz](https://bio.link/minhazabedin)
- Version 2.0.0 | Last Updated: May 2025

---

### 🔗 Links
- [GitHub Repository](https://github.com/okayabedin/diu-cgpa)
- [Live Demo](https://diucgpa.netlify.app)