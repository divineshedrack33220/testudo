import db from './database.js';

const pages = [
  {
    title: 'Home',
    slug: 'home',
    status: 'published',
    template: 'default',
    sections: [
      { type: 'hero', content: { heading: 'Reliable Technical & Procurement Solutions', subheading: 'Empowering Nigerian enterprises to operate efficiently and focus on their core business.' } },
      { type: 'aboutPreview', content: '<h2>Who We Are</h2><p>Testudo is a trusted technical and procurement solutions provider serving large enterprises across Nigeria. We help organizations streamline operations, reduce costs, and meet their deliverables through world-class supply chain and technical services.</p><p>With a proven track record working with industry leaders including Unilever, MTN, Total, Ardova, NPA, and Ecobank, we bring reliability and expertise to every engagement.</p>' },
      { type: 'videoUrl', content: { url: 'https://www.youtube.com/embed/GPu4KwNgjZE?controls=0' } },
      { type: 'servicesPreview', content: { heading: 'What We Do', text: 'From technical procurement to project management, we provide end-to-end solutions that help enterprises perform at their best.', btnText: 'View All Services' } },
      { type: 'stats', content: { years: '15', projects: '200', clients: '50', awards: '12' } },
      { type: 'testimonial1', content: { name: 'Chidi Okonkwo', role: 'Procurement Director, Unilever Nigeria', text: 'Testudo has been a reliable partner in our supply chain operations. Their attention to detail and commitment to delivery timelines is exceptional.' } },
      { type: 'testimonial2', content: { name: 'Folake Adeyemi', role: 'Operations Manager, MTN Nigeria', text: 'Working with Testudo streamlined our technical procurement process significantly. They understand the urgency and precision our industry demands.' } },
      { type: 'testimonial3', content: { name: 'Emeka Nwosu', role: 'GM Technical, Ardova Plc', text: 'Testudo\'s technical expertise and dependable service have made them a go-to partner for our critical procurement needs.' } }
    ],
    seo: { metaTitle: 'Home — Testudo Technical & Procurement Solutions', metaDescription: 'Testudo provides reliable technical and procurement solutions for large Nigerian enterprises across telecom, oil & gas, and manufacturing.' }
  },
  {
    title: 'About',
    slug: 'about',
    status: 'published',
    template: 'default',
    sections: [
      { type: 'hero', content: { heading: 'About Us', subheading: 'Built on a foundation of reliability, integrity, and technical excellence — serving Nigeria\'s leading enterprises.' } },
      { type: 'story', content: '<h2>Our Story</h2><p>Founded with a vision to bridge the gap between operational challenges and world-class solutions, Testudo has grown into a trusted technical and procurement partner for Nigeria\'s leading enterprises.</p><p>Our name, inspired by the Roman military formation, reflects our commitment to strength through unity, strategic positioning, and unwavering reliability — values that define every engagement we undertake.</p>' },
      { type: 'videoUrl', content: { url: 'https://www.youtube.com/embed/GPu4KwNgjZE?controls=0' } },
      { type: 'mission', content: { heading: 'Our Mission', text: 'To help organizations operate more efficiently by providing world-class technical and procurement solutions that enable them to focus on their core business.' } },
      { type: 'vision', content: { heading: 'Our Vision', text: 'To be the most dependable technical and procurement partner for enterprises across Africa, setting the standard for reliability and operational excellence.' } },
      { type: 'value1', content: { title: 'Reliability', text: 'We deliver on our commitments, every time. Our clients trust us to meet deadlines and maintain the highest quality standards.' } },
      { type: 'value2', content: { title: 'Integrity', text: 'Transparency and honesty guide every transaction. We build lasting relationships through ethical business practices.' } },
      { type: 'value3', content: { title: 'Excellence', text: 'We bring deep technical expertise and rigorous quality control to every project, ensuring superior outcomes.' } },
      { type: 'value4', content: { title: 'Partnership', text: 'We work as an extension of our clients\' teams, aligning with their goals and delivering solutions that drive real impact.' } },
      { type: 'stats', content: { years: '15', projects: '200', clients: '50', awards: '12' } },
      { type: 'whatWeDo', content: { heading: 'What We Do', text: 'From technical procurement and supply chain management to project execution and consulting, we provide end-to-end solutions that help enterprises operate efficiently.' } },
      { type: 'testimonial', content: { name: 'Chidi Okonkwo', role: 'Procurement Director, Unilever Nigeria', text: 'Testudo has been a reliable partner in our supply chain operations. Their professionalism is outstanding.' } }
    ],
    seo: { metaTitle: 'About — Testudo Technical & Procurement Solutions', metaDescription: 'Learn about Testudo\'s mission to provide reliable technical and procurement solutions for Nigerian enterprises.' }
  },
  {
    title: 'Services',
    slug: 'services',
    status: 'published',
    template: 'default',
    sections: [
      { type: 'hero', content: { heading: 'Our Services', subheading: 'Comprehensive technical and procurement solutions designed to help your organization operate efficiently and meet its deliverables.' } },
      { type: 'intro', content: { heading: 'What We Offer', text: 'We provide end-to-end technical and procurement services that enable enterprises to focus on their core business while we handle the operational complexities.' } },
      { type: 'service1', content: { title: 'Technical Procurement', desc: 'End-to-end procurement of technical equipment, spare parts, and specialized materials sourced from verified global and local suppliers with strict quality assurance.' } },
      { type: 'service2', content: { title: 'Supply Chain Management', desc: 'Comprehensive supply chain solutions including logistics coordination, inventory management, and vendor relationship management to optimize your operations.' } },
      { type: 'service3', content: { title: 'Project Management', desc: 'Expert project management services for technical and infrastructure projects, ensuring timely delivery within budget and specification.' } },
      { type: 'service4', content: { title: 'Technical Consulting', desc: 'Strategic technical consulting to help organizations assess needs, evaluate solutions, and implement optimal operational frameworks.' } },
      { type: 'process1', content: { title: 'Needs Assessment', text: 'We begin by thoroughly understanding your operational requirements, challenges, and objectives through detailed consultation.' } },
      { type: 'process2', content: { title: 'Sourcing & Evaluation', text: 'We leverage our extensive supplier network to source quality materials and services, evaluating options against your specifications.' } },
      { type: 'process3', content: { title: 'Execution & Delivery', text: 'Our team manages the end-to-end execution, coordinating logistics and ensuring timely delivery to your specified locations.' } },
      { type: 'process4', content: { title: 'Support & Follow-up', text: 'We provide ongoing support and follow-up to ensure delivered solutions meet your expectations and performance requirements.' } },
      { type: 'why1', content: { title: 'Proven Track Record', text: 'Trusted by industry leaders including Unilever, MTN, Total, Ardova, NPA, and Ecobank for critical procurement and technical needs.' } },
      { type: 'why2', content: { title: 'Deep Industry Expertise', text: 'Our team brings extensive experience across telecom, oil & gas, manufacturing, and public sector operations.' } },
      { type: 'why3', content: { title: 'Reliable Delivery', text: 'We pride ourselves on meeting commitments. Our clients count on us to deliver on time, every time.' } },
      { type: 'why4', content: { title: 'End-to-End Service', text: 'From needs assessment to delivery and support, we manage the entire lifecycle so you can focus on your core business.' } },
      { type: 'testimonial', content: { name: 'Folake Adeyemi', role: 'Operations Manager, MTN Nigeria', text: 'Testudo streamlined our technical procurement process. Their understanding of our industry\'s urgency is remarkable.' } }
    ],
    seo: { metaTitle: 'Services — Testudo Technical & Procurement Solutions', metaDescription: 'Explore our technical procurement, supply chain management, project management, and consulting services.' }
  },
  {
    title: 'Team',
    slug: 'team',
    status: 'published',
    template: 'default',
    sections: [
      { type: 'hero', content: { heading: 'Meet Our Team', subheading: 'A dedicated team of procurement specialists, technical experts, and operations professionals committed to your success.' } },
      { type: 'intro', content: { heading: 'Who We Are', text: 'Our team brings together deep industry expertise across procurement, technical operations, logistics, and client relations — united by a shared commitment to reliability and excellence.' } },
      { type: 'member1', content: { name: 'Ken Ogunbiyi', role: 'Managing Director', bio: 'With over 20 years of experience in technical procurement and operations, Ken leads Testudo with a vision to set the standard for reliability in enterprise solutions.' } },
      { type: 'member2', content: { name: 'Adaobi Eze', role: 'Head of Procurement', bio: 'Adaobi oversees all procurement operations, ensuring every order meets specifications and is delivered on schedule with full quality assurance.' } },
      { type: 'member3', content: { name: 'Tunde Bakare', role: 'Technical Operations Manager', bio: 'Tunde brings deep technical expertise across telecom and energy sectors, managing complex technical procurement and project execution.' } },
      { type: 'member4', content: { name: 'Chioma Obi', role: 'Client Relations Director', bio: 'Chioma ensures seamless communication and partnership with our enterprise clients, building relationships that deliver lasting value.' } },
      { type: 'expertise1', content: { title: 'Procurement', text: 'Expert sourcing and procurement of technical equipment, spare parts, and specialized materials.' } },
      { type: 'expertise2', content: { title: 'Supply Chain', text: 'End-to-end supply chain management including logistics, inventory, and vendor coordination.' } },
      { type: 'expertise3', content: { title: 'Project Execution', text: 'Technical project management ensuring timely delivery within budget and specification.' } },
      { type: 'expertise4', content: { title: 'Consulting', text: 'Strategic consulting to optimize operational frameworks and improve efficiency.' } },
      { type: 'culture', content: { heading: 'Our Culture', text: 'We believe in fostering a culture of reliability, accountability, and continuous improvement. Every member of our team is committed to delivering excellence and building trust with every client engagement.' } },
      { type: 'joinUs', content: { heading: 'Join Our Team', text: 'We are always looking for talented professionals who share our commitment to reliability and technical excellence. If you have expertise in procurement, supply chain, or technical operations, we would love to hear from you.' } },
      { type: 'testimonial', content: { name: 'Emeka Nwosu', role: 'GM Technical, Ardova Plc', text: 'Testudo\'s technical expertise and dependable service have made them a go-to partner for our critical procurement needs.' } }
    ],
    seo: { metaTitle: 'Team — Testudo Technical & Procurement Solutions', metaDescription: 'Meet the experienced team behind Testudo — procurement specialists and technical experts serving Nigerian enterprises.' }
  },
  {
    title: 'Contact',
    slug: 'contact',
    status: 'published',
    template: 'default',
    sections: [
      { type: 'hero', content: { heading: 'Get In Touch', subheading: 'Ready to streamline your operations? Reach out to our team and let us help you meet your deliverables.' } },
      { type: 'intro', content: { heading: 'Let\'s Talk', text: 'Whether you need technical procurement support, supply chain solutions, or want to learn more about our services, our team is ready to help.' } },
      { type: 'address', content: { label: 'Visit Us', value: 'Lagos, Nigeria' } },
      { type: 'hours', content: { label: 'Office Hours', value: 'Monday — Friday, 8:00 AM — 5:00 PM' } },
      { type: 'email', content: { label: 'Email Us', value: 'info@testudong.com' } },
      { type: 'phone', content: { label: 'Call Us', value: '+234 1 234 5678' } },
      { type: 'social', content: { heading: 'Follow Us', text: 'Stay connected with us on social media for the latest updates and insights.' } },
      { type: 'faq1', content: { q: 'What industries do you serve?', a: 'We primarily serve large enterprises across telecom, oil & gas, manufacturing, and public sectors in Nigeria.' } },
      { type: 'faq2', content: { q: 'What is your procurement process?', a: 'Our process begins with a thorough needs assessment, followed by supplier evaluation, competitive sourcing, quality assurance, and timely delivery with full documentation.' } },
      { type: 'faq3', content: { q: 'Do you work with international suppliers?', a: 'Yes, we leverage a global network of verified suppliers to source quality materials and equipment, complementing our local procurement capabilities.' } },
      { type: 'faq4', content: { q: 'How do you ensure quality and compliance?', a: 'We maintain strict quality control processes, working only with certified suppliers and conducting thorough inspections before delivery to ensure compliance with specifications.' } }
    ],
    seo: { metaTitle: 'Contact — Testudo Technical & Procurement Solutions', metaDescription: 'Get in touch with Testudo for reliable technical and procurement solutions. Contact our team today.' }
  }
];

export function seedPages() {
  const stmt = db.prepare(
    'INSERT INTO pages (title, slug, sections, seo, status, template) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const transaction = db.transaction((items) => {
    for (const p of items) {
      stmt.run(
        p.title,
        p.slug,
        JSON.stringify(p.sections),
        JSON.stringify(p.seo),
        p.status,
        p.template
      );
    }
  });
  transaction(pages);
}
