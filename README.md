# Diego Aguirre - Personal Portfolio

A modern, entrepreneurial Jekyll portfolio website showcasing Diego's work in Data Science, Machine Learning, and Financial Engineering.

## 🚀 Features

- **Modern Design**: Sleek, professional design with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **SEO Optimized**: Built with Jekyll SEO plugins for better search visibility
- **Fast Loading**: Optimized assets and minimal dependencies
- **Interactive**: Smooth scrolling, hover effects, and dynamic content
- **Entrepreneurial Focus**: Designed to showcase technical skills and business acumen

## 🎨 Design Highlights

- **Hero Section**: Eye-catching gradient background with animated grid pattern
- **Project Showcase**: Interactive cards featuring your GitHub projects
- **Skills Display**: Visual skill tags highlighting your expertise
- **Contact Section**: Professional social media integration
- **Mobile-First**: Responsive design that looks great on all devices

## 📁 Project Structure

```
├── _config.yml          # Jekyll configuration
├── _layouts/
│   └── default.html     # Main layout template
├── assets/
│   ├── css/
│   │   └── main.css     # Main stylesheet
│   └── js/
│       └── main.js      # JavaScript functionality
├── index.html           # Homepage content
├── Gemfile              # Ruby dependencies
└── README.md           # This file
```

## 🛠️ Local Development

### Prerequisites

- Ruby (version 2.6 or higher)
- RubyGems
- Bundler

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/insdaguirre/insdaguirre.github.io.git
   cd insdaguirre.github.io
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Run the development server**
   ```bash
   bundle exec jekyll serve
   ```

4. **View your site**
   Open your browser and navigate to `http://localhost:4000`

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

1. **Create a new repository** named `insdaguirre.github.io` on GitHub
2. **Push your code** to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/insdaguirre/insdaguirre.github.io.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "GitHub Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

4. **Your site will be available at**: `https://insdaguirre.github.io`

### Option 2: Netlify

1. **Connect your GitHub repository** to Netlify
2. **Build settings**:
   - Build command: `bundle exec jekyll build`
   - Publish directory: `_site`
3. **Deploy automatically** on every push to main branch

### Option 3: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

## 🔧 Customization

### Personal Information

Update the following files to customize your information:

- `_config.yml`: Site title, description, and social links
- `index.html`: Personal bio, projects, and contact information

### Styling

- `assets/css/main.css`: All styling and animations
- Color scheme can be modified in the `:root` CSS variables

### Projects

Add or modify projects in the `index.html` file under the "Projects Section". Each project card includes:
- Project icon (Font Awesome)
- Project title and description
- Technology tags

## 📱 Mobile Optimization

The site is fully responsive with:
- Mobile-first design approach
- Touch-friendly navigation
- Optimized images and assets
- Fast loading times

## 🔍 SEO Features

- Meta tags for social sharing
- Open Graph and Twitter Card support
- Structured data markup
- Sitemap generation
- RSS feed

## 🎯 Performance

- Optimized CSS and JavaScript
- Minimal external dependencies
- Fast loading times
- Mobile-optimized images

## 📞 Support

If you need help with deployment or customization:

1. Check the [Jekyll documentation](https://jekyllrb.com/docs/)
2. Review [GitHub Pages documentation](https://pages.github.com/)
3. Open an issue in this repository

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ and Jekyll for Diego Aguirre** 