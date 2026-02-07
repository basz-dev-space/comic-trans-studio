import { writable } from 'svelte/store';

export type Locale = 'en' | 'th';

export const locale = writable<Locale>('en');

const messages: Record<Locale, Record<string, string>> = {
  en: {
    'app.name': 'ComicTrans Studio',
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.login': 'Login',
    'nav.search': 'Quick search',
    'footer.tag': 'Fast translation layout • palette-first UI',
    'footer.desc': 'Designed for comic localization workflows.',

    'landing.badge': 'Production workspace',
    'landing.title': 'Translate faster with a cleaner, one-screen workflow.',
    'landing.desc': 'From project setup to chapter export, keep everything visible and reduce context switching.',
    'landing.cta.start': 'Start now',
    'landing.cta.browse': 'Browse projects',
    'landing.kpi.projects': 'Project-first navigation',
    'landing.kpi.projectsDesc': 'Jump to any project with fewer clicks.',
    'landing.kpi.editor': 'Editor + Grid together',
    'landing.kpi.editorDesc': 'Canvas editing and text coordinates stay synchronized.',
    'landing.kpi.export': 'Delivery-ready exports',
    'landing.kpi.exportDesc': 'ZIP/PDF export actions are available in the chapter toolbar.',

    'login.title': 'Sign in',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.demo': 'Demo',

    'projects.badge': 'Workspace',
    'projects.title': 'Projects',
    'projects.welcome': 'Welcome back',
    'projects.new': 'Create project',
    'projects.placeholder': 'Project name',
    'projects.open': 'Open',

    'project.badge': 'Project',
    'project.back': 'Back to projects',
    'project.newChapter': 'Create chapter',
    'project.newChapterAndOpen': 'Create + open',
    'project.chapterPlaceholder': 'New chapter name',
    'project.rename': 'Rename',
    'project.delete': 'Delete',
    'project.open': 'Open chapter',

    'chapter.badge': 'Chapter studio',
    'chapter.back': 'Back',
    'chapter.newPage': 'New page',
    'chapter.addText': 'Add text',
    'chapter.quick': 'Quick add page + text',
    'chapter.exportZip': 'Export ZIP',
    'chapter.exportPdf': 'Export PDF',
    'chapter.pages': 'Pages',

    'grid.title': 'Text Data Grid',
    'grid.items': 'items',
    'editor.title': 'Canvas editor',
    'editor.help': 'Drag, resize, and edit text objects'
  },
  th: {
    'app.name': 'ComicTrans Studio',
    'nav.home': 'หน้าแรก',
    'nav.projects': 'โปรเจกต์',
    'nav.login': 'เข้าสู่ระบบ',
    'nav.search': 'ค้นหาด่วน',
    'footer.tag': 'เลย์เอาต์เร็วขึ้น • UI ตามพาเลตต์สี',
    'footer.desc': 'ออกแบบสำหรับงานแปลคอมิกครบเวิร์กโฟลว์',

    'landing.badge': 'พื้นที่ทำงานหลัก',
    'landing.title': 'แปลได้เร็วขึ้นด้วยหน้าจอเดียวที่ใช้ง่าย',
    'landing.desc': 'ตั้งค่าโปรเจกต์ แก้ไขบท และส่งออกงานได้จากหน้าที่เห็นครบ ลดการสลับหน้าจอ',
    'landing.cta.start': 'เริ่มใช้งาน',
    'landing.cta.browse': 'ดูโปรเจกต์',
    'landing.kpi.projects': 'เข้าถึงโปรเจกต์ไว',
    'landing.kpi.projectsDesc': 'ไปยังโปรเจกต์ที่ต้องการได้ในไม่กี่คลิก',
    'landing.kpi.editor': 'ตัวแก้ไข + ตารางพร้อมกัน',
    'landing.kpi.editorDesc': 'แก้บนแคนวาสและพิกัดข้อความซิงก์ตลอด',
    'landing.kpi.export': 'ส่งออกพร้อมใช้งาน',
    'landing.kpi.exportDesc': 'ปุ่มส่งออก ZIP/PDF อยู่ในแถบเครื่องมือของบท',

    'login.title': 'เข้าสู่ระบบ',
    'login.email': 'อีเมล',
    'login.password': 'รหัสผ่าน',
    'login.demo': 'เดโม',

    'projects.badge': 'พื้นที่ทำงาน',
    'projects.title': 'โปรเจกต์',
    'projects.welcome': 'ยินดีต้อนรับกลับ',
    'projects.new': 'สร้างโปรเจกต์',
    'projects.placeholder': 'ชื่อโปรเจกต์',
    'projects.open': 'เปิด',

    'project.badge': 'โปรเจกต์',
    'project.back': 'กลับไปหน้าโปรเจกต์',
    'project.newChapter': 'สร้างบท',
    'project.newChapterAndOpen': 'สร้างแล้วเปิดทันที',
    'project.chapterPlaceholder': 'ชื่อบทใหม่',
    'project.rename': 'เปลี่ยนชื่อ',
    'project.delete': 'ลบ',
    'project.open': 'เปิดบท',

    'chapter.badge': 'สตูดิโอบท',
    'chapter.back': 'กลับ',
    'chapter.newPage': 'หน้าใหม่',
    'chapter.addText': 'เพิ่มข้อความ',
    'chapter.quick': 'เพิ่มหน้า + ข้อความ',
    'chapter.exportZip': 'ส่งออก ZIP',
    'chapter.exportPdf': 'ส่งออก PDF',
    'chapter.pages': 'หน้า',

    'grid.title': 'ตารางข้อความ',
    'grid.items': 'รายการ',
    'editor.title': 'ตัวแก้ไขแคนวาส',
    'editor.help': 'ลาก ปรับขนาด และแก้ข้อความได้ทันที'
  }
};

export function t(lang: Locale, key: string) {
  return messages[lang]?.[key] ?? messages.en[key] ?? key;
}
