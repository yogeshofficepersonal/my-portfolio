/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Code, Award, BookOpen, Send, Menu, X, Sun, Moon, Linkedin, Github, Twitter, Shield, PlusCircle, Edit, Trash2, LogIn, LogOut } from 'lucide-react';

// Import Firebase and Firestore functions
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    setDoc,
    addDoc,
    deleteDoc,
    getDocs,
    query,
} from 'firebase/firestore';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';


// --- Firebase Configuration ---
const firebaseConfig = {
      apiKey: "AIzaSyAB9se5DMw9S5PRvqkvL7Y6Thgy6iI5Svc",
      authDomain: "portfolio-backend-8cd7d.firebaseapp.com",
      projectId: "portfolio-backend-8cd7d",
      storageBucket: "portfolio-backend-8cd7d.appspot.com",
      messagingSenderId: "471626251199",
      appId: "1:471626251199:web:a4d566a2f8e669d11cff0a"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// --- Main App Component ---
const App = () => {
    const [activePage, setActivePage] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // ONE CHANGE: Set default theme to 'light' for debugging
    const [theme, setTheme] = useState('light');
    
    // State for portfolio data, fetched from Firestore
    const [personalInfo, setPersonalInfo] = useState({ 
        name: "Yogesh", 
        title: "Full-Stack Developer & Cybersecurity Enthusiast", 
        bio: "I'm a passionate Full-Stack Developer and Cybersecurity Enthusiast, currently pursuing a B.Tech in Computer Science with a specialization in Cybersecurity and IoT. My academic background has given me a strong technical foundation and a forward-thinking mindset that drives me to explore how technology can solve real-world problems.\n\nI have hands-on experience in developing responsive web applications and a strong grasp of Cloud Computing, IoT, and modern development frameworks. I enjoy working on end-to-end projects—from designing intuitive user interfaces to building secure back-end systems. Alongside development, I'm deeply interested in the principles of secure coding, ethical hacking, and data protection.\n\nWith a deep curiosity for future technologies, I'm constantly learning and adapting to the evolving tech landscape. I’m passionate about contributing to innovations that are not only efficient but also secure and sustainable, with a vision to make technology smarter and safer for everyone. Whether I'm writing clean code or analyzing security threats, I believe in creating digital solutions that are both innovative and secure.\n\n\"Thinking should become your capital asset, no matter whatever ups and downs you come across in your life.\"",
        socials: {} 
    });
    const [skills, setSkills] = useState([
        { id: 'python', name: 'Python', level: 90 },
        { id: 'kali', name: 'Kali Linux', level: 80 },
        { id: 'js', name: 'JavaScript', level: 75 },
        { id: 'html', name: 'HTML', level: 95 },
    ]);
    const [works, setWorks] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [blog, setBlog] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for authentication
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Listen for authentication state changes and sign in
    useEffect(() => {
        // The onAuthStateChanged listener is the most reliable way to get the user state.
        // It runs once on load, and then again any time the user signs in or out.
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setIsAuthLoading(false);
            if (user && !user.isAnonymous && activePage === 'login') {
                setActivePage('admin');
            }
        });
        // We clean up the listener when the component unmounts.
        return () => unsubscribe();
    }, [activePage]);

    // Fetch all portfolio data from Firestore
    useEffect(() => {
        // We don't need to wait for auth anymore, as the rules are public for reads.
        setLoading(true);
        
        const unsubPersonalInfo = onSnapshot(doc(db, "portfolio", "personalInfo"), (doc) => {
            if (doc.exists()) {
                setPersonalInfo(doc.data());
            }
        });

        const unsubSkills = onSnapshot(query(collection(db, "skills")), (snapshot) => {
            if (!snapshot.empty) {
                setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        });

        const unsubWorks = onSnapshot(query(collection(db, "works")), (snapshot) => {
            setWorks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubCerts = onSnapshot(query(collection(db, "certifications")), (snapshot) => {
            setCertifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubBlog = onSnapshot(query(collection(db, "blog")), (snapshot) => {
            setBlog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setTimeout(() => setLoading(false), 500);

        return () => {
            unsubPersonalInfo();
            unsubSkills();
            unsubWorks();
            unsubCerts();
            unsubBlog();
        };
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setActivePage('home');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const navLinks = [
        { id: 'home', title: 'Home', icon: User },
        { id: 'about', title: 'About', icon: User },
        { id: 'works', title: 'Works', icon: Code },
        { id: 'certifications', title: 'Certifications', icon: Award },
        { id: 'blog', title: 'Blog', icon: BookOpen },
        { id: 'contact', title: 'Contact', icon: Send },
    ];
    
    if (!isAuthLoading) {
        if (currentUser) { // Simplified check: if there's any user, show Admin/Logout
            navLinks.push({ id: 'admin', title: 'Admin', icon: Shield });
        } else {
            navLinks.push({ id: 'login', title: 'Login', icon: LogIn });
        }
    }

    const renderPage = () => {
        if (loading || isAuthLoading) {
            return <div className="flex justify-center items-center h-screen"><p>Loading Portfolio...</p></div>;
        }
        switch (activePage) {
            case 'home': return <HomePage data={personalInfo} setActivePage={setActivePage} />;
            case 'about': return <AboutPage data={{ personalInfo, skills }} />;
            case 'works': return <WorksPage data={works} />;
            case 'certifications': return <CertificationsPage data={certifications} />;
            case 'blog': return <BlogPage data={blog} />;
            case 'contact': return <ContactPage />;
            case 'admin': return currentUser ? <AdminPage /> : <LoginPage />;
            case 'login': return <LoginPage />;
            default: return <HomePage data={personalInfo} setActivePage={setActivePage} />;
        }
    };

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans transition-colors duration-500">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                            onClick={() => setActivePage('home')}
                        >
                            {personalInfo.name?.split(' ')[0]}<span className="text-gray-500">.</span>
                        </motion.div>
                        
                        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => setActivePage(link.id)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
                                        activePage === link.id
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <link.icon className="mr-2 h-4 w-4" />
                                        {link.title}
                                    </div>
                                    {activePage === link.id && (
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                                            layoutId="underline"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                             {currentUser && (
                                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            )}
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </nav>

                        <div className="md:hidden flex items-center">
                            <button onClick={toggleTheme} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md z-50">
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-40 pt-20"
                    >
                        <nav className="flex flex-col items-center justify-center h-full space-y-6">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        setActivePage(link.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-2xl font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {link.title}
                                </button>
                            ))}
                            {currentUser && (
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-2xl font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    Logout
                                </button>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage}
                        variants={pageVariants}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={pageTransition}
                    >
                        {renderPage()}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="bg-gray-200 dark:bg-gray-800 py-6 mt-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} {personalInfo.name}. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

// --- Page Components ---

const Section = ({ children, className = '' }) => (
    <section className={`container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}>
        {children}
    </section>
);

const SectionTitle = ({ children }) => (
    <motion.h2 
        className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white relative inline-block"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        {children}
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-indigo-500 rounded-full"></span>
    </motion.h2>
);

const HomePage = ({ data, setActivePage }) => {
    const { name, title, socials } = data;
    const words = title ? title.split(' ') : [];

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:opacity-20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 dark:opacity-20"></div>
            <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 dark:opacity-20"></div>

            <div className="text-center z-10 p-4">
                <motion.h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                    Hi, I'm <span className="text-indigo-600 dark:text-indigo-400">{name}</span>
                </motion.h1>
                <motion.h2 className="text-xl md:text-2xl mt-4 text-gray-600 dark:text-gray-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}>
                    <AnimatePresence>
                        {words.map((word, i) => (
                            <motion.span key={word + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }} className="inline-block mr-2">
                                {word}
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </motion.h2>
                <motion.div className="mt-8 flex justify-center space-x-4" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.2 }}>
                    <a href={socials?.github} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Github size={28} /></a>
                    <a href={socials?.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Linkedin size={28} /></a>
                    <a href={socials?.twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Twitter size={28} /></a>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.4 }}>
                    <button onClick={() => setActivePage('contact')} className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-all duration-300">
                        Get In Touch
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

const AboutPage = ({ data }) => {
    const { personalInfo, skills } = data;
    const { bio } = personalInfo;
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <Section>
            <div className="text-center"><SectionTitle>About Me</SectionTitle></div>
            <div className="grid md:grid-cols-5 gap-12 items-center">
                <motion.div className="md:col-span-2" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-lg">
                        <img src={personalInfo.profileImageUrl || `https://i.pravatar.cc/300?u=${personalInfo.email}`} alt={personalInfo.name} className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x300/e2e8f0/64748b?text=AD'; }} />
                    </div>
                </motion.div>
                <motion.div className="md:col-span-3" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{bio}</p>
                </motion.div>
            </div>
            <div className="mt-20">
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">My Skills</h3>
                <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                    {skills.map((skill) => (
                        <motion.div key={skill.id} className="flex flex-col items-center" variants={itemVariants}>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                                <motion.div className="bg-indigo-600 h-2.5 rounded-full" initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} />
                            </div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </Section>
    );
};

const WorksPage = ({ data: works }) => {
    return (
        <Section>
            <div className="text-center"><SectionTitle>My Works</SectionTitle></div>
             <motion.div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {works.map((work) => (
                    <motion.div key={work.id} className="group relative overflow-hidden rounded-lg shadow-lg" whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                        <img src={work.imageUrl} alt={work.title} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6 transition-all duration-500 opacity-0 group-hover:opacity-100">
                            <h3 className="text-xl font-bold text-white mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{work.title}</h3>
                            <p className="text-indigo-300 text-sm mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">{work.category}</p>
                            <p className="text-gray-200 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">{work.description}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};

const CertificationsPage = ({ data: certifications }) => {
    return (
        <Section>
            <div className="text-center"><SectionTitle>Certifications</SectionTitle></div>
            <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certifications.map((cert) => (
                    <motion.div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 text-center hover:shadow-xl transition-shadow duration-300">
                        <img src={cert.imageUrl} alt={cert.name} className="w-full h-48 object-cover mb-4 rounded-md" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{cert.name}</h3>
                        <p className="text-indigo-500 dark:text-indigo-400 mt-1">{cert.issuer}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{cert.date}</p>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};

const BlogPage = ({ data: blog }) => {
    return (
        <Section>
            <div className="text-center"><SectionTitle>My Blog</SectionTitle></div>
            <motion.div className="max-w-3xl mx-auto space-y-8">
                {blog.map((post) => (
                    <motion.div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                        {post.imageUrl && (
                            <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-4" />
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{post.date}</p>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{post.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                        <a href={`#`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Read More &rarr;</a>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};

const ContactPage = () => {
    const [status, setStatus] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => {
            setStatus('success');
            e.target.reset();
            setTimeout(() => setStatus(''), 3000);
        }, 1500);
    };

    return (
        <Section>
            <div className="text-center">
                <SectionTitle>Contact Me</SectionTitle>
                <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 -mt-8 mb-12">Have a project in mind or just want to say hi? Feel free to reach out.</p>
            </div>
            <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Your Name" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="email" placeholder="Your Email" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <input type="text" placeholder="Subject" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <textarea placeholder="Your Message" rows="5" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                    <div className="text-center">
                        <button type="submit" disabled={status === 'sending'} className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400 w-full md:w-auto">
                            {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                    {status === 'success' && <p className="text-center text-green-500 mt-4">Message sent successfully!</p>}
                </form>
            </motion.div>
        </Section>
    );
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError('Failed to log in. Please check your email and password.');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <Section>
            <div className="text-center"><SectionTitle>Admin Login</SectionTitle></div>
            <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handleLogin} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="text-center">
                        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400">
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </Section>
    );
}

// --- Admin Components ---

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('works');
    const tabs = ['works', 'certifications', 'blog'];
    
    const [works, setWorks] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [blog, setBlog] = useState([]);

    useEffect(() => {
        const unsubWorks = onSnapshot(query(collection(db, "works")), (snapshot) => setWorks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubCerts = onSnapshot(query(collection(db, "certifications")), (snapshot) => setCertifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubBlog = onSnapshot(query(collection(db, "blog")), (snapshot) => setBlog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        
        return () => {
            unsubWorks();
            unsubCerts();
            unsubBlog();
        }
    }, []);


    const handleAddItem = async (section, newItemData) => {
        try {
            await addDoc(collection(db, section), newItemData);
            console.log(`${section.slice(0, -1)} added successfully!`);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleDeleteItem = async (section, id) => {
        if (true) { 
            try {
                await deleteDoc(doc(db, section, id));
                console.log(`Item deleted successfully!`);
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    return (
        <Section>
            <div className="text-center"><SectionTitle>Admin Panel</SectionTitle></div>
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 border-b border-gray-300 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                            >
                                Manage {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'works' && <AdminWorks data={works} onAdd={(item) => handleAddItem('works', item)} onDelete={(id) => handleDeleteItem('works', id)} />}
                            {activeTab === 'certifications' && <AdminCertifications data={certifications} onAdd={(item) => handleAddItem('certifications', item)} onDelete={(id) => handleDeleteItem('certifications', id)} />}
                            {activeTab === 'blog' && <AdminBlog data={blog} onAdd={(item) => handleAddItem('blog', item)} onDelete={(id) => handleDeleteItem('blog', id)} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </Section>
    );
};

const AdminSection = ({ title, data, formFields, onAdd, onDelete }) => {
    const [formData, setFormData] = useState(formFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData(formFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New {title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    {formFields.map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea name={field.name} id={field.name} value={formData[field.name]} onChange={handleInputChange} required rows="3" className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                            ) : (
                                <input type={field.type} name={field.name} id={field.name} value={formData[field.name]} onChange={handleInputChange} required className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            )}
                        </div>
                    ))}
                    <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors">
                        <PlusCircle className="h-5 w-5 mr-2" /> Add {title}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Existing {title}s</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {data.length > 0 ? data.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{item.title || item.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category || item.issuer || item.date}</p>
                            </div>
                            <div>
                                <button onClick={() => console.log('Edit functionality to be implemented!')} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit className="h-5 w-5" /></button>
                                <button onClick={() => onDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="h-5 w-5" /></button>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 dark:text-gray-400">No items yet. Add one using the form.</p>}
                </div>
            </div>
        </div>
    );
};

const AdminWorks = ({ data, onAdd, onDelete }) => (
    <AdminSection
        title="Work"
        data={data}
        onAdd={onAdd}
        onDelete={onDelete}
        formFields={[
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'category', label: 'Category', type: 'text' },
            { name: 'imageUrl', label: 'Image URL', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
        ]}
    />
);

const AdminCertifications = ({ data, onAdd, onDelete }) => (
    <AdminSection
        title="Certification"
        data={data}
        onAdd={onAdd}
        onDelete={onDelete}
        formFields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'issuer', label: 'Issuer', type: 'text' },
            { name: 'date', label: 'Date', type: 'text' },
            { name: 'imageUrl', label: 'Image URL', type: 'text' },
        ]}
    />
);

const AdminBlog = ({ data, onAdd, onDelete }) => (
    <AdminSection
        title="Blog Post"
        data={data}
        onAdd={onAdd}
        onDelete={onDelete}
        formFields={[
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'date', label: 'Date', type: 'text' },
            { name: 'slug', label: 'Slug (e.g., my-new-post)', type: 'text' },
            { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
            { name: 'imageUrl', label: 'Image URL', type: 'text' },
        ]}
    />
);


export default App;
