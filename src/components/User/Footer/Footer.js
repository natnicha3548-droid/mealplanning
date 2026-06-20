import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUniversity, FaMapMarkerAlt, FaCaretRight } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* ส่วนที่ 1: ข้อมูลระบบ */}
        <div className="footer-section brand-section">
          <h3 style={{ fontSize: '1.5rem' }}>การพัฒนาระบบสนับสนุนการวางแผนรับประทานอาหารในชีวิตประจำวัน</h3>
          <p>ระบบสารสนเทศเพื่อสนับสนุนการตัดสินใจและวางแผนโภชนาการส่วนบุคคล พัฒนาขึ้นโดยบูรณาการหลักโภชนาการศาสตร์และเทคโนโลยีสารสนเทศ</p>
        </div>

        {/* ส่วนที่ 2: เมนูหลัก */}
        <div className="footer-section links-section">
          <h4>ฟังก์ชันการทำงาน</h4>
          <ul>
            <li><Link to="/"><FaCaretRight className="list-icon"/> หน้าหลัก</Link></li>
            <li><Link to="/menu"><FaCaretRight className="list-icon"/> ฐานข้อมูลอาหาร</Link></li>
            <li><Link to="/calculate"><FaCaretRight className="list-icon"/> ประเมินภาวะโภชนาการ</Link></li>
            <li><Link to="/meal-plan"><FaCaretRight className="list-icon"/> ระบบวางแผนมื้ออาหาร</Link></li>
          </ul>
        </div>

        {/* ส่วนที่ 3: ข้อมูลโครงการ */}
        <div className="footer-section contact-section">
          <h4>ข้อมูลโครงการ</h4>
          <p className="contact-item">
            <FaGraduationCap className="footer-icon" />
            <span>โครงงานวิทยาการคอมพิวเตอร์ (ปีการศึกษา 2569)</span>
          </p>
          <p className="contact-item">
            <FaUniversity className="footer-icon" />
            <span>คณะวิทยาศาสตร์และเทคโนโลยี</span>
          </p>
          <p className="contact-item">
            <FaMapMarkerAlt className="footer-icon" />
            <span>มหาวิทยาลัยราชภัฏเลย</span>
          </p>
        </div>

      </div>

      {/* ส่วนล่างสุด (Copyright) */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear() + 543} สงวนลิขสิทธิ์ การพัฒนาระบบสนับสนุนการวางแผนรับประทานอาหารในชีวิตประจำวัน | มหาวิทยาลัยราชภัฏเลย</p>
      </div>
    </footer>
  );
};

export default Footer;