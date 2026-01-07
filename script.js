/**
 * Windows XP Portfolio Script
 * - Window Management (Drag, Open, Close, Maximize)
 * - Taskbar & Start Menu
 * - App Specific Logic (Projects, Resume, Contact)
 * - System Logic (Clock, Login/Logout)
 * - Sound Effects Added!
 */

let zIndex = 100;
const iconMap = {
    about: 'img/chrome_icon.png',
    work: 'img/file_icon.png',
    contact: 'img/mail_icon.png',
    resume: 'img/word_icon.png',
    notepad: 'img/file_icon.png',
    ai: 'img/clippy.png',
};

// ==================== SOUND EFFECTS ====================

let soundsEnabled = true; // Default: on

const sounds = {
    logon: new Audio('sound/logon.wav'),
    startup: new Audio('sound/startup.wav'),
    shutdown: new Audio('sound/shutdown.wav'),
    logoff: new Audio('sound/logoff.wav'),
    minimize: new Audio('sound/minimize.wav'),
    restore: new Audio('sound/restore.wav'), // or restoredown.wav if you have it
    notify: new Audio('sound/notify.wav'),
    ding: new Audio('sound/ding.wav'),
    error: new Audio('sound/error.wav'),
    // Add more if desired, e.g., exclamation: new Audio('sound/exclamation.wav')
};

// Lower volume to avoid being too loud
Object.values(sounds).forEach(sound => {
    if (sound) sound.volume = 0.5;
});

function playSound(key) {
    if (soundsEnabled && sounds[key]) {
        sounds[key].currentTime = 0;
        sounds[key].play().catch(() => { }); // Fail silently (e.g., autoplay policy)
    }
}

function toggleSounds() {
    soundsEnabled = !soundsEnabled;
    const icon = document.getElementById('volume-icon');
    if (icon) {
        // Switch between speaker high and speaker mute unicode or icon
        icon.textContent = soundsEnabled ? '🔊' : '🔇';
    }
}

/* =========================================
   1. DRAGGING & WINDOW MANAGEMENT
   ========================================= */

document.addEventListener('mousedown', function (e) {
    const header = e.target.closest('.window-header');
    if (!header) return;

    const win = header.closest('.window');
    if (!win) return;

    if (e.target.closest('.window-controls') || e.target.closest('.win-menu') || e.target.closest('.no-drag')) return;

    win.style.zIndex = ++zIndex;
    updateTaskbar();

    if (window.innerWidth <= 768 || win.dataset.maximized === 'true') {
        return;
    }

    e.preventDefault();

    const rect = win.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
    const shiftY = e.clientY - rect.top;

    function onMouseMove(moveEvent) {
        moveEvent.preventDefault();
        win.style.left = (moveEvent.clientX - shiftX) + 'px';
        win.style.top = (moveEvent.clientY - shiftY) + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function openWindow(id) {
    const win = document.getElementById('window-' + id);
    if (!win) return;

    win.style.display = 'block';
    win.dataset.open = 'true';
    win.dataset.minimized = 'false';
    win.style.zIndex = ++zIndex;
    playSound('restore');

    updateTaskbar();
}

function closeWindow(id) {
    const win = document.getElementById('window-' + id);
    if (!win) return;

    playSound('ding');
    win.style.display = 'none';
    win.dataset.open = 'false';
    win.dataset.minimized = 'false';

    updateTaskbar();
}

function minimizeWindow(id) {
    const win = document.getElementById('window-' + id);
    if (!win) return;

    playSound('minimize');
    win.style.display = 'none';
    win.dataset.minimized = 'true';

    updateTaskbar();
}

function toggleMaximize(id) {
    const win = document.getElementById('window-' + id);
    if (!win) return;

    const isMax = win.dataset.maximized === 'true';

    if (isMax) {
        playSound('restore');
        win.style.left = win.dataset.prevLeft || '100px';
        win.style.top = win.dataset.prevTop || '100px';
        win.style.width = win.dataset.prevWidth || 'auto';
        win.style.height = win.dataset.prevHeight || 'auto';
        win.style.resize = 'both';
        win.dataset.maximized = 'false';
    } else {
        playSound('minimize');
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;

        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 30px)';
        win.style.resize = 'none';
        win.dataset.maximized = 'true';
        win.style.zIndex = ++zIndex;
    }
}

/* =========================================
   2. TASKBAR & START MENU
   ========================================= */

function updateTaskbar() {
    const taskbarItems = document.getElementById('taskbar-items');
    taskbarItems.innerHTML = '';

    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        if (win.dataset.open === 'true') {
            const id = win.id.replace('window-', '');

            // Create Taskbar Item
            const btn = document.createElement('div');
            // Styles for the XP taskbar button
            btn.className = 'px-2 h-full flex items-center gap-2 cursor-pointer border-r border-blue-800 min-w-[120px] max-w-[150px] overflow-hidden whitespace-nowrap select-none';

            // Active/Inactive Styling
            const isTopWindow = (parseInt(win.style.zIndex) === zIndex) && (win.style.display !== 'none');

            if (isTopWindow) {
                btn.style.background = '#1e52b7'; // Darker pressed look
                btn.style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.3)';
                btn.style.color = '#fff';
            } else {
                btn.style.background = '#3b8df1';
                btn.style.color = '#fff';
                btn.onmouseenter = () => btn.style.background = '#245edb';
                btn.onmouseleave = () => btn.style.background = '#3b8df1';
            }

            // Icon
            const img = document.createElement('img');
            img.src = iconMap[id] || 'img/chrome_icon.png';
            img.className = 'w-4 h-4 object-contain';

            // Text
            const span = document.createElement('span');
            span.className = 'text-xs truncate';
            span.textContent = id === 'contact' ? 'Contact Me' : (id.charAt(0).toUpperCase() + id.slice(1));

            btn.appendChild(img);
            btn.appendChild(span);

            // Click Logic
            btn.onclick = () => {
                if (win.style.display === 'none') {
                    // Restore from minimize
                    win.style.display = 'block';
                    win.dataset.minimized = 'false';
                    win.style.zIndex = ++zIndex;
                } else {
                    // If active and on top, minimize. Otherwise, bring to front.
                    const currentZ = parseInt(win.style.zIndex || 0);
                    if (currentZ === zIndex) {
                        minimizeWindow(id);
                    } else {
                        win.style.zIndex = ++zIndex;
                    }
                }
                updateTaskbar();
            };
            taskbarItems.appendChild(btn);
        }
    });
}

function toggleStartMenu() {
    playSound('notify');
    const menu = document.getElementById('startMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

// Close Start Menu when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('#startMenu') && !e.target.closest('.start-button')) {
        document.getElementById('startMenu').style.display = 'none';
    }
    // Also close window menus if clicking elsewhere
    if (!e.target.closest('.menu-btn')) {
        document.querySelectorAll('.win-menu .menu-btn.open').forEach(b => b.classList.remove('open'));
    }
});

/* =========================================
   3. APP LOGIC: CONTACT (Updated)
   ========================================= */

function contactClick() {
    // Opens the simulated window
    openWindow('contact');
}

/* =========================================
   4. APP LOGIC: FILE EXPLORER (Projects)
   ========================================= */

// --- Data Structure ---
const fileSystem = {
    'root': {
        name: 'Projects',
        path: 'C:\\My Documents\\Projects',
        items: [
            { id: 'websites', name: 'Websites', type: 'folder', icon: 'img/file_icon.png' },
            { id: 'graphics', name: 'Graphics', type: 'folder', icon: 'img/file_icon.png' },
            { id: 'unity', name: 'Game', type: 'folder', icon: 'img/file_icon.png' },
            { id: 'unity', name: 'Media', type: 'folder', icon: 'img/file_icon.png' }
        ]
    },
    'websites': {
        name: 'Websites',
        parent: 'root',
        path: 'C:\\My Documents\\Projects\\Websites',
        items: [
            {
                id: 'proveritas',
                name: 'Proveritas.html',
                type: 'link',
                url: 'https://www.proveritas.com.au/',
                icon: 'img/chrome_icon.png'
            },
            {
                id: 'nswuwh',
                name: 'NSW_UWH.html',
                type: 'link',
                url: 'https://nswunderwaterhockey.com/',
                icon: 'img/chrome_icon.png'
            },
            // --- NEW ITEM START ---
            {
                id: 'readme',
                name: 'README.txt',
                type: 'text',
                icon: 'img/file_icon.png', // Or use a specific text file icon if you have one
                content: `PROJECT NOTES:
------------------------------------------
1. Proveritas & STEMM Influence Lab
I developed this platform to bridge the gap between high-level leadership coaching and technical expertise. My goal was to create a digital home for Proveritas that reflected its commitment to sustainability while maintaining a professional, corporate identity.

I built the site using React and accessible HTML/CSS to ensure a clean, high-performance user experience. I focused on typography and intuitive navigation to handle the daily traffic of 15–20 professional users.

I recently launched the STEMM Influence Lab within the site to provide a specialized resource for professionals in Science, Technology, Engineering, Mathematics, and Medicine. I wanted a scalable architecture that could grow alongside this niche laboratory.

2. NSW Underwater Hockey
This project is a personal passion of mine, combining my technical skills with my life as a competitive swimming athlete and coach. I created this portal to serve as the central hub for our niche sports community, which now sees 30–60 active users daily.

I implemented a dynamic event scheduling system and a curated media gallery to keep the community engaged. The site is designed to be highly functional for both desktop and mobile users on the go.

As a national competitor and a coach for the Under-19 youth team, I realized the community lacked a reliable digital "home base." I built this to manage our schedules and showcase the sport through high-quality media, strengthening our local and national presence.`
            }
        ]
    },
    'graphics': {
        name: 'Graphics',
        parent: 'root',
        path: 'C:\\My Documents\\Projects\\Graphics',
        items: [
            // Using placeholder images for the carousel demonstration
            { id: 'img1', name: 'carousel_cover.png', type: 'image', src: 'img/graphics/pro1.png' },
            { id: 'img2', name: 'email_banner.png', type: 'image', src: 'img/graphics/pro2.png' },
            { id: 'img3', name: 'tourny_logo.png', type: 'image', src: 'img/graphics/uwh1.png' },
            { id: 'img4', name: 'neon_wallpaper.psd', type: 'image', src: 'img/graphics/uwh2.png' },
            { id: 'img5', name: 'pullup_banner.png', type: 'image', src: 'img/graphics/uwh3.png' },
            { id: 'img6', name: 'results.png', type: 'image', src: 'img/graphics/uwh4.png' },
            { id: 'img7', name: 'announcement.jpg', type: 'image', src: 'img/graphics/uwh5.jpg' },
            { id: 'img8', name: 'tourny_banner.png', type: 'image', src: 'img/graphics/uwh6.png' }
        ]
    },
    'unity': {
        name: 'Game',
        parent: 'root',
        path: 'C:\\My Documents\\Projects\\Game',
        items: [
            {
                id: 'game1',
                name: 'game_report.pdf',
                type: 'link',
                url: 'doc/COMP1150_GDT_Report_Isaak.pdf', // Ensure this path is correct relative to index.html
                icon: 'img/file_icon.png'
            }
        ]
    },
        'websites': {
        name: 'Websites',
        parent: 'root',
        path: 'C:\\My Documents\\Projects\\Websites',
        items: [
            {
                id: 'nationals',
                name: 'uwhnationalsau.html',
                type: 'link',
                url: 'https://www.facebook.com/uwhnationalsau',
                icon: 'img/chrome_icon.png'
            },
            {
                id: 'nswuwh',
                name: 'NSW_UWH.html',
                type: 'link',
                url: 'https://www.facebook.com/nswunderwaterhockey/',
                icon: 'img/chrome_icon.png'
            },
            {
                id: 'sydkings',
                name: 'syd_kings.html',
                type: 'link',
                url: 'https://www.facebook.com/sydneyuwh/',
                icon: 'img/chrome_icon.png'
            },
            // --- NEW ITEM START ---
            {
                id: 'readme',
                name: 'README.txt',
                type: 'text',
                icon: 'img/file_icon.png', // Or use a specific text file icon if you have one
                content: `PROJECT NOTES:
------------------------------------------
SOCIAL MEDIA
1. Australian Underwater Hockey National Championships - 1.4k followers
2. NSW Underwater Hockey - 380 followers
3. Sydney Kings Underwater Hockey - 1.2k followers

I manage these pages by tailoring content to three distinct levels of the sport’s community. My approach balances high-stakes tournament coverage for the National Championships, administrative updates and recruitment for NSW state members, and social, club-focused engagement for the Sydney Kings. By cross-promoting events and synchronizing messaging, I maintain a cohesive digital presence that keeps followers informed, connected, and growing across all tiers of the sport.`
            }
        ]
    }
};

let currentPathId = 'root';

// --- Explorer Functions ---

function renderExplorer(folderId) {
    const grid = document.getElementById('file-grid');
    const addressInput = document.getElementById('explorer-address');

    if (!grid) return;

    // Clear current view
    grid.innerHTML = '';

    // Get Folder Data
    const folder = fileSystem[folderId];
    if (!folder) return;

    currentPathId = folderId;
    addressInput.value = folder.path;

    // Render Items
    folder.items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'file-item';

        // Determine Icon
        let iconSrc = item.icon;
        if (item.type === 'image') iconSrc = 'img/file_icon.png'; // Generic image icon
        if (!iconSrc) iconSrc = 'img/file_icon.png';

        el.innerHTML = `
            <img src="${iconSrc}" class="file-icon-img">
            <span class="file-name">${item.name}</span>
        `;

        // Click Logic
        el.onclick = () => {
            if (item.type === 'folder') {
                renderExplorer(item.id);
            } else if (item.type === 'link') {
                window.open(item.url, '_blank');
            } else if (item.type === 'image') {
                openGallery(folderId, item.id);
            } else if (item.type === 'text') {  // --- ADD THIS BLOCK ---
                openNotepad(item.name, item.content);
            }
        };

        grid.appendChild(el);
    });
}

function navigateExplorer(id) {
    renderExplorer(id);
}

function goBack() {
    // Check if we are actually in the "Work" (Explorer) window context
    const workWindow = document.getElementById('window-work');
    if (workWindow.style.display === 'none') return;

    const curr = fileSystem[currentPathId];
    if (curr && curr.parent) {
        renderExplorer(curr.parent);
    }
}

function goUp() {
    goBack(); // Same logic
}

// --- About / Details Logic (Preserved) ---
function switchAboutTab(tabName) {
    document.querySelectorAll('.about-page-content').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + tabName);
    if (target) target.classList.remove('hidden');
}

function toggleTaskBox(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.task-arrow');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        content.style.display = 'none';
        arrow.textContent = '▼';
    }
}

function openNotepad(title, content) {
    const titleEl = document.getElementById('notepad-title');
    const contentEl = document.getElementById('notepad-content');

    if (titleEl) titleEl.textContent = title + " - Notepad";
    if (contentEl) contentEl.value = content;

    openWindow('notepad');
}

/* =========================================
   GALLERY / CAROUSEL LOGIC
   ========================================= */

let galleryImages = [];
let currentImgIndex = 0;

function openGallery(folderId, startImageId) {
    const folder = fileSystem[folderId];
    if (!folder) return;

    // Filter only images from the folder
    galleryImages = folder.items.filter(i => i.type === 'image');

    if (galleryImages.length === 0) return;

    // Find index of clicked image
    currentImgIndex = galleryImages.findIndex(i => i.id === startImageId);
    if (currentImgIndex === -1) currentImgIndex = 0;

    updateGalleryImage();
    document.getElementById('gallery-overlay').style.display = 'flex';
}

function closeGallery() {
    document.getElementById('gallery-overlay').style.display = 'none';
}

function updateGalleryImage() {
    const imgObj = galleryImages[currentImgIndex];
    const imgEl = document.getElementById('gallery-img');
    const capEl = document.getElementById('gallery-caption');

    imgEl.src = imgObj.src;
    capEl.textContent = `${imgObj.name} (${currentImgIndex + 1} of ${galleryImages.length})`;
}

function nextImage() {
    currentImgIndex++;
    if (currentImgIndex >= galleryImages.length) currentImgIndex = 0;
    updateGalleryImage();
}

function prevImage() {
    currentImgIndex--;
    if (currentImgIndex < 0) currentImgIndex = galleryImages.length - 1;
    updateGalleryImage();
}

/* =========================================
   5. APP LOGIC: RESUME
   ========================================= */

function toggleResumeZoom() {
    const img = document.getElementById('resume-image');
    if (img) img.classList.toggle('zoomed');
}

function downloadResume() {
    const link = document.createElement('a');
    link.href = 'doc/Isaak_Campbell_Resume.pdf';
    link.download = 'doc/Isaak_Campbell_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printResume() {
    const w = window.open('doc/Isaak_Campbell_Resume.pdf', '_blank');
    if (w) {
        w.addEventListener('load', () => setTimeout(() => w.print(), 250));
    }
}

/* =========================================
   6. MENU BAR UTILS (File, Edit, View)
   ========================================= */

function toggleWindowMenu(btn, ev) {
    if (btn.classList.contains('menu-disabled')) return;

    // Close others
    document.querySelectorAll('.win-menu .menu-btn.open').forEach(b => {
        if (b !== btn) b.classList.remove('open');
    });

    btn.classList.toggle('open');
    if (ev) ev.stopPropagation();
}

function saveWindow(id) {
    alert('This would save the ' + id + ' file in a real OS!');
    document.querySelectorAll('.win-menu .menu-btn.open').forEach(b => b.classList.remove('open'));
}

function printWindow(id) {
    alert('Sending ' + id + ' to the printer...');
    document.querySelectorAll('.win-menu .menu-btn.open').forEach(b => b.classList.remove('open'));
}

function exitWindow(id) {
    closeWindow(id);
    document.querySelectorAll('.win-menu .menu-btn.open').forEach(b => b.classList.remove('open'));
}

/* =========================================
   7. SYSTEM (Clock, Fullscreen, Login)
   ========================================= */

function updateClock() {
    const now = new Date();
    // 12-hour format like standard Windows
    document.getElementById('clock').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
setInterval(updateClock, 1000);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    } else {
        document.exitFullscreen();
    }
}

function loginToDesktop() {
    playSound('logon');
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.transition = 'opacity 0.5s ease';
    loginScreen.style.opacity = '0';
    setTimeout(() => {
        loginScreen.style.display = 'none';
        playSound('startup');
    }, 500);
}

function logout() {
    playSound('shutdown');
    document.getElementById('startMenu').style.display = 'none';

    // Close all windows on logout
    document.querySelectorAll('.window').forEach(win => {
        win.style.display = 'none';
        win.dataset.open = 'false';
    });
    updateTaskbar();

    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.display = 'flex';
    setTimeout(() => { loginScreen.style.opacity = '1'; }, 10);
}

/* =========================================
   8. SYSTEM INITIALIZATION
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize all Windows
    document.querySelectorAll('.window').forEach(win => {
        const isDisplayed = win.style.display === 'block';
        win.dataset.open = isDisplayed ? 'true' : 'false';
        win.dataset.minimized = isDisplayed ? 'false' : 'true';
        win.dataset.maximized = 'false';

        // Header double-click to maximize
        const header = win.querySelector('.window-header');
        if (header) {
            header.addEventListener('dblclick', () => {
                toggleMaximize(win.id.replace('window-', ''));
            });
        }
    });

    // 2. Setup Specialized Inputs
    const aiInput = document.getElementById('ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendAIMessage();
        });
    }

    // 3. Contact Window "Send" Button
    const contactSendBtn = document.getElementById('contact-send-btn');
    if (contactSendBtn) {
        contactSendBtn.addEventListener('click', () => {
            const email = "isaakcampb311@gmail.com";
            const subject = encodeURIComponent("Portfolio Inquiry");
            const body = encodeURIComponent("Hi Isaak,\n\nI saw your portfolio and would like to connect.");
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
            closeWindow('contact');
        });
    }

    // 4. Run UI Refresh
    renderExplorer('root');
    updateClock();
    updateTaskbar();
});

function toggleCRT() {
    const overlay = document.getElementById('crt-overlay');
    const btn = document.querySelector('.tray-btn[title="Toggle CRT Effect"]');

    if (overlay) {
        overlay.classList.toggle('hidden');
        // Optional: Visual feedback on the button
        if (!overlay.classList.contains('hidden')) {
            btn.style.background = '#004e8c'; // Active state
        } else {
            btn.style.background = ''; // Default state
        }
    }

}
