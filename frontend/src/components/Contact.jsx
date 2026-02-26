import React from 'react';

function Contact() {
    return (
        <div>
            <div className="page-title-section">
                <span className="page-icon">📞</span>
                <h2 className="page-title">Contact Information</h2>
                <p className="page-subtitle">Controller of Examinations Office</p>
            </div>

            <div className="contact-controller-card">
                <div className="contact-controller-name">Dr. K. V. Narasimha Murthy</div>
                <div className="contact-controller-title">Controller of Examinations</div>
            </div>

            <div className="contact-grid">
                <div className="card">
                    <h3 className="contact-card-title">📍 Address</h3>
                    <p className="contact-text">
                        Madanapalle Institute of Technology & Science<br />
                        Post Box No: 14, Kadiri Road<br />
                        Angallu, Madanapalle-517325<br />
                        Andhra Pradesh, India
                    </p>
                </div>

                <div className="card">
                    <h3 className="contact-card-title">📞 Phone</h3>
                    <p className="contact-text">
                        <strong>Office:</strong> 8571-280255<br />
                        <strong>Alternate:</strong> 8571-280706
                    </p>
                </div>

                <div className="card">
                    <h3 className="contact-card-title">📧 Email</h3>
                    <p className="contact-text">
                        <a href="mailto:coe@mits.ac.in" className="contact-link">coe@mits.ac.in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Contact;