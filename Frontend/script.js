document.addEventListener('DOMContentLoaded', () => {
    const contactListDiv = document.getElementById('contactList');
    const contactDetailsDiv = document.getElementById('contactDetails');
    const searchInput = document.getElementById('searchInput');
    const addContactBtn = document.getElementById('addContactBtn');
    const contactModal = document.getElementById('contactModal');
    const modalTitle = document.getElementById('modalTitle');
    const contactForm = document.getElementById('contactForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactPhoneInput = document.getElementById('contactPhone');
    const contactAddress1Input = document.getElementById('contactAddress1');
    const contactAddress2Input = document.getElementById('contactAddress2');
    const contactCountryInput = document.getElementById('contactCountry');
    const contactStateInput = document.getElementById('contactState');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');


    let contacts = [];
    let currentEditContactId = null;

    function imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Strip the prefix
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function fetchContacts() {
        try {
            const res = await fetch('http://localhost:3000/contacts');
            if (!res.ok) throw new Error('Failed to fetch contacts');
            const data = await res.json();

            contacts = data.map(c => ({
                id: c.id,
                name: `${c.first_name} ${c.last_name}`.trim(),
                email: c.email,
                phone: c.phone,
                profile_img: c.profile_img ? `data:image/png;base64,${c.profile_img}` : 'img/Google_Contacts_logo.png',
                address1: c.addresses?.[0]?.street || '',
                address2: c.addresses?.[1]?.street || ''
            }));

            renderContactList();
            const fiona = contacts.find(c => c.name.toLowerCase().includes('fiona'));
            displayContactDetails(fiona || contacts[0]);
            if (fiona) {
                const fionaItem = document.querySelector(`.contact-item[data-id="${fiona.id}"]`);
                if (fionaItem) fionaItem.classList.add('active');
            }
        } catch (err) {
            console.error('Error fetching contacts:', err);
        }
    }

    function renderContactList(filter = '') {
        contactListDiv.innerHTML = '';
        const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

        filtered.forEach(contact => {
            const div = document.createElement('div');
            div.classList.add('contact-item');
            div.dataset.id = contact.id;
            div.innerHTML = `
            <span>${contact.name}</span>
            <div class="contact-actions">
                <button class="delete-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                        <path d="M 24 4 C 20.491685 4 17.570396 6.6214322 17.080078 10 L 10.238281 10 A 1.50015 1.50015 0 0 0 9.9804688 9.9785156 A 1.50015 1.50015 0 0 0 9.7578125 10 L 6.5 10 A 1.50015 1.50015 0 1 0 6.5 13 L 8.6386719 13 L 11.15625 39.029297 C 11.427329 41.835926 13.811782 44 16.630859 44 L 31.367188 44 C 34.186411 44 36.570826 41.836168 36.841797 39.029297 L 39.361328 13 L 41.5 13 A 1.50015 1.50015 0 1 0 41.5 10 L 38.244141 10 A 1.50015 1.50015 0 0 0 37.763672 10 L 30.919922 10 C 30.429604 6.6214322 27.508315 4 24 4 z M 24 7 C 25.879156 7 27.420767 8.2681608 27.861328 10 L 20.138672 10 C 20.579233 8.2681608 22.120844 7 24 7 z M 11.650391 13 L 36.347656 13 L 33.855469 38.740234 C 33.730439 40.035363 32.667963 41 31.367188 41 L 16.630859 41 C 15.331937 41 14.267499 40.033606 14.142578 38.740234 L 11.650391 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z"/>
                    </svg>
                </button>
                <button class="edit-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M3.5,24h15A3.51,3.51,0,0,0,22,20.487V12.95a1,1,0,0,0-2,0v7.537A1.508,1.508,0,0,1,18.5,22H3.5A1.508,1.508,0,0,1,2,20.487V5.513A1.508,1.508,0,0,1,3.5,4H11a1,1,0,0,0,0-2H3.5A3.51,3.51,0,0,0,0,5.513V20.487A3.51,3.51,0,0,0,3.5,24Z"/>
                        <path d="M9.455,10.544l-.789,3.614a1,1,0,0,0,.271.921,1.038,1.038,0,0,0,.92.269l3.606-.791a1,1,0,0,0,.494-.271l9.114-9.114a3,3,0,0,0,0-4.243,3.07,3.07,0,0,0-4.242,0l-9.1,9.123A1,1,0,0,0,9.455,10.544Zm10.788-8.2a1.022,1.022,0,0,1,1.414,0,1.009,1.009,0,0,1,0,1.413l-.707.707L19.536,3.05Zm-8.9,8.914,6.774-6.791,1.4,1.407-6.777,6.793-1.795.394Z"/>
                    </svg>
                    
                </button>
            </div>
        `;

            div.addEventListener('click', e => {
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;

                document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                const selected = contacts.find(c => c.id === contact.id);
                displayContactDetails(selected);
            });

            // Delete contact button 
            const deleteBtn = div.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Delete this contact?')) {
                    await fetch(`http://localhost:3000/contacts/${contact.id}`, { method: 'DELETE' });
                    fetchContacts();
                    displayContactDetails(null);
                }
            });

            // Edit contact button
            const editBtn = div.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                const contactData = contacts.find(c => c.id === contact.id);
                if (contactData) {
                    modalTitle.textContent = 'Edit';
                    firstNameInput.value = contactData.name.split(' ')[0] || '';
                    lastNameInput.value = contactData.name.split(' ')[1] || '';
                    contactEmailInput.value = contactData.email;
                    contactPhoneInput.value = contactData.phone;
                    contactAddress1Input.value = contactData.address1;
                    contactAddress2Input.value = contactData.address2;
                    currentEditContactId = contact.id;
                    contactModal.style.display = 'flex';
                }
            });
            contactListDiv.appendChild(div);
        });
    }

    function displayContactDetails(contact) {
        contactDetailsDiv.classList.add('active');
        contactDetailsDiv.innerHTML = `
            <img src="${contact.profile_img}" class="profile-pic"/>
            <h2>${contact.name}</h2>
            <p class="email">${contact.email || 'N/A'}</p>
            <p class="phone">${contact.phone || 'N/A'}</p>
            <p class="address-line">
                <span id="displayAddress1">${contact.address1}</span>
                <input type="text" id="editAddress1" value="${contact.address1}" style="display:none;">
                <svg class="edit-address-icon" data-address-field="address1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M3.5,24h15A3.51,3.51,0,0,0,22,20.487V12.95a1,1,0,0,0-2,0v7.537A1.508,1.508,0,0,1,18.5,22H3.5A1.508,1.508,0,0,1,2,20.487V5.513A1.508,1.508,0,0,1,3.5,4H11a1,1,0,0,0,0-2H3.5A3.51,3.51,0,0,0,0,5.513V20.487A3.51,3.51,0,0,0,3.5,24Z"/>
                        <path d="M9.455,10.544l-.789,3.614a1,1,0,0,0,.271.921,1.038,1.038,0,0,0,.92.269l3.606-.791a1,1,0,0,0,.494-.271l9.114-9.114a3,3,0,0,0,0-4.243,3.07,3.07,0,0,0-4.242,0l-9.1,9.123A1,1,0,0,0,9.455,10.544Zm10.788-8.2a1.022,1.022,0,0,1,1.414,0,1.009,1.009,0,0,1,0,1.413l-.707.707L19.536,3.05Zm-8.9,8.914,6.774-6.791,1.4,1.407-6.777,6.793-1.795.394Z"/>
                    </svg>
            </p>
            <p class="address-line">
                <span id="displayAddress2">${contact.address2}</span>
                <input type="text" id="editAddress2" value="${contact.address2}" style="display:none;">
                <svg class="edit-address-icon" data-address-field="address2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M3.5,24h15A3.51,3.51,0,0,0,22,20.487V12.95a1,1,0,0,0-2,0v7.537A1.508,1.508,0,0,1,18.5,22H3.5A1.508,1.508,0,0,1,2,20.487V5.513A1.508,1.508,0,0,1,3.5,4H11a1,1,0,0,0,0-2H3.5A3.51,3.51,0,0,0,0,5.513V20.487A3.51,3.51,0,0,0,3.5,24Z"/>
                        <path d="M9.455,10.544l-.789,3.614a1,1,0,0,0,.271.921,1.038,1.038,0,0,0,.92.269l3.606-.791a1,1,0,0,0,.494-.271l9.114-9.114a3,3,0,0,0,0-4.243,3.07,3.07,0,0,0-4.242,0l-9.1,9.123A1,1,0,0,0,9.455,10.544Zm10.788-8.2a1.022,1.022,0,0,1,1.414,0,1.009,1.009,0,0,1,0,1.413l-.707.707L19.536,3.05Zm-8.9,8.914,6.774-6.791,1.4,1.407-6.777,6.793-1.795.394Z"/>
                    </svg>
            </p>`;

        document.querySelectorAll('.edit-address-icon').forEach(icon => {
            icon.addEventListener('click', e => {
                const field = e.currentTarget.dataset.addressField;
                const displaySpan = document.getElementById(`display${field.charAt(0).toUpperCase() + field.slice(1)}`);
                const input = document.getElementById(`edit${field.charAt(0).toUpperCase() + field.slice(1)}`);
                displaySpan.style.display = 'none';
                input.style.display = 'inline-block';
                input.focus();
            });
        });

        document.querySelectorAll('.address-line input[type="text"]').forEach(input => {
            input.addEventListener('blur', e => saveInlineAddressChange(e, contact.id));
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveInlineAddressChange(e, contact.id);
                }
            });
        });
    }

    async function saveInlineAddressChange(e, contactId) {
        const input = e.target;
        const field = input.id.replace('edit', '').toLowerCase(); // address1 or address2
        const displaySpan = document.getElementById(`display${field.charAt(0).toUpperCase() + field.slice(1)}`);

        const index = contacts.findIndex(c => c.id === contactId);
        if (index === -1) return;

        const updatedValue = input.value.trim();
        if (contacts[index][field] === updatedValue) {
            input.style.display = 'none';
            displaySpan.style.display = 'inline';
            return;
        }

        contacts[index][field] = updatedValue;
        displaySpan.textContent = updatedValue || 'N/A';
        const contact = contacts[index];

        const addressUpdates = [
            {
                address_type: 'address1',
                street: field === 'address1' ? updatedValue : contact.address1,
                state: contactStateInput.value.trim(),
                country: contactCountryInput.value.trim()
            },
            {
                address_type: 'address2',
                street: field === 'address2' ? updatedValue : contact.address2,
                state: contactStateInput.value.trim(),
                country: contactCountryInput.value.trim()
            }
        ];

        let base64Image = null;
        const imageFileInput = document.getElementById('contactImage');
        if (imageFileInput && imageFileInput.files[0]) {
            base64Image = await imageToBase64(imageFileInput.files[0]);
        }

        const payload = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: contactEmailInput.value.trim(),
            phone: contactPhoneInput.value.trim(),
            profile_img: base64Image || contact.profile_img?.split(',')[1] || null,
            addresses: addressUpdates
        };

        try {
            await fetch(`http://localhost:3000/contacts/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error('Failed to update address:', err);
            alert('Failed to save address change.');
        }

        input.style.display = 'none';
        displaySpan.style.display = 'inline';
    }


    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^\d{3}-\d{3}-\d{4}$/.test(phone);
    }

    function validateForm() {
        let valid = true;

        if (!firstNameInput.value.trim()) valid = false;
        if (!lastNameInput.value.trim()) valid = false;

        if (contactEmailInput.value.trim() && !validateEmail(contactEmailInput.value.trim())) {
            emailError.textContent = 'Invalid email format';
            valid = false;
        } else {
            emailError.textContent = '';
        }

        if (contactPhoneInput.value.trim() && !validatePhone(contactPhoneInput.value.trim())) {
            phoneError.textContent = 'Phone must be XXX-XXX-XXXX';
            valid = false;
        } else {
            phoneError.textContent = '';
        }
        return valid;
    }


    // Events
    searchInput.addEventListener('keyup', e => renderContactList(e.target.value));
    addContactBtn.addEventListener('click', () => {
        contactForm.reset();
        currentEditContactId = null;
        emailError.textContent = '';
        phoneError.textContent = '';
        contactModal.style.display = 'flex';
    });


    const closeModal = () => contactModal.style.display = 'none';
    cancelContactBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => {
        if (e.target === contactModal) closeModal();
    });

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (!validateForm()) return;

        const imageFile = document.getElementById('contactImage').files[0];
        const base64Image = imageFile ? await imageToBase64(imageFile) : null;

        const payload = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: contactEmailInput.value.trim(),
            phone: contactPhoneInput.value.trim(),
            profile_img: base64Image,
            addresses: [
                {
                    address_type: 'address1',
                    street: contactAddress1Input.value.trim(),
                    state: contactStateInput.value.trim(),
                    country: contactCountryInput.value.trim()
                },
                {
                    address_type: 'address2',
                    street: contactAddress2Input.value.trim(),
                    state: contactStateInput.value.trim(),
                    country: contactCountryInput.value.trim()
                }
            ]
        };

        try {
            if (currentEditContactId) {
                await fetch(`http://localhost:3000/contacts/${currentEditContactId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                alert('Contact updated successfully');
            } else {
                await fetch('http://localhost:3000/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                alert('Contact added successfully');
            }
            contactModal.style.display = 'none';
            fetchContacts();
        } catch (err) {
            alert('Failed to save contact.');
        }
    });

    fetchContacts();
});




