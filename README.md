# StudentTools - All-in-One Student Productivity Platform

A comprehensive web-based productivity platform designed specifically for students, offering essential academic tools and resources in one unified interface.

## 🚀 Features

### Academic Tools
- **GPA Calculator** - Support for 4.0 scale, 10-point scale, and percentage systems
- **Unit Converter** - Convert between physics, math, CS, and engineering units
- **Scientific Calculator** - Advanced mathematical operations and functions

### Productivity Tools
- **Study Timer** - Pomodoro technique with customizable intervals
- **Timetable Maker** - Weekly schedule organizer with export options
- **Notes Organizer** - Markdown editor with themes and tags

### Career Tools
- **Resume Builder** - Professional templates with PDF export
- **Flashcard Creator** - Digital flashcards for effective learning

### Additional Features
- **Dashboard** - Personalized overview of tools and progress
- **Blog Section** - Student productivity tips and resources
- **Responsive Design** - Works seamlessly on all devices
- **Clean UI** - Modern, intuitive interface built with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Styling**: TailwindCSS with custom design system
- **Icons**: Lucide React
- **PDF Generation**: jsPDF and html2canvas
- **Animations**: Framer Motion
- **Development**: ESLint, TypeScript

## 📁 Project Structure

```
student_tools/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── tools/              # Tools pages
│   │   │   ├── page.tsx        # Tools overview
│   │   │   ├── gpa-calculator/ # GPA Calculator tool
│   │   │   └── study-timer/    # Study Timer tool
│   │   └── dashboard/          # User dashboard
│   └── components/             # Reusable components
│       ├── layout/             # Header, Footer
│       └── home/               # Homepage components
├── public/                     # Static assets
├── .github/                    # GitHub configuration
└── package.json               # Dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student_tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for text and backgrounds
- **Accent Colors**: Specific colors for different tool categories

### Components
- **Cards**: Consistent card design for tool items
- **Buttons**: Primary and secondary button styles
- **Forms**: Standardized input fields and form layouts

## 🔧 Key Tools Overview

### GPA Calculator
- Multiple grading systems support
- Real-time calculation
- Course management interface
- Clean, intuitive design

### Study Timer
- Pomodoro technique implementation
- Customizable work and break intervals
- Session tracking
- Audio and visual notifications
- Progress tracking

### Dashboard
- Personal productivity overview
- Quick access to frequently used tools
- Progress tracking and goals
- Recent activity summary

## 🚀 Deployment

The application is optimized for deployment on:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Firebase Hosting**

### Build for Production
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

### Upcoming Features
- [ ] User authentication and data persistence
- [ ] Formula repository
- [ ] Citation generator
- [ ] Grade tracker
- [ ] Mobile app (React Native)
- [ ] Offline functionality (PWA)
- [ ] Theme customization
- [ ] Export/import user data

### Current Status
- ✅ Basic tool implementations
- ✅ Responsive design
- ✅ Clean UI/UX
- ✅ TypeScript integration
- ✅ Component architecture

## 💡 Usage Tips

1. **Start with the Dashboard** - Get an overview of available tools
2. **Use the Study Timer** - Implement Pomodoro technique for better focus
3. **Track Your GPA** - Regular monitoring helps academic planning
4. **Organize Your Schedule** - Use the timetable maker for better time management

## 🐛 Bug Reports & Feature Requests

Please use the GitHub issues page to report bugs or request new features.

## 📞 Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for students worldwide**
