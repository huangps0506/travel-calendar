// Travel Calendar Application
class TravelCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.travels = this.loadTravels();
        this.editingTravelId = null;
        
        this.init();
    }

    init() {
        this.renderCalendar();
        this.renderTravelList();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        
        // Form submission
        document.getElementById('travelForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTravelPlan();
        });

        // Close modal on outside click
        document.getElementById('travelModal').addEventListener('click', (e) => {
            if (e.target.id === 'travelModal') {
                this.closeModal();
            }
        });

        // Sync date fields
        document.getElementById('travelDate').addEventListener('change', (e) => {
            const startDate = document.getElementById('startDate');
            if (!startDate.value) {
                startDate.value = e.target.value;
            }
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElement(day, true, new Date(year, month - 1, day));
            calendarDays.appendChild(dayElement);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayElement = this.createDayElement(day, false, date);
            
            // Highlight today
            if (date.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }

            // Check if there's a travel on this date
            const dateStr = this.formatDate(date);
            const hasTravel = this.travels.some(travel => {
                const start = new Date(travel.startDate);
                const end = new Date(travel.endDate);
                return date >= start && date <= end;
            });

            if (hasTravel) {
                dayElement.classList.add('has-travel');
                const indicator = document.createElement('div');
                indicator.className = 'travel-indicator';
                dayElement.appendChild(indicator);
            }

            calendarDays.appendChild(dayElement);
        }

        // Next month days
        const totalCells = calendarDays.children.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true, new Date(year, month + 1, day));
            calendarDays.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth, date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        dayElement.addEventListener('click', () => {
            this.selectedDate = date;
            this.openModal(date);
        });

        return dayElement;
    }

    openModal(date) {
        const modal = document.getElementById('travelModal');
        const form = document.getElementById('travelForm');
        
        // Reset form
        form.reset();
        this.editingTravelId = null;

        // Set date
        const dateStr = this.formatDate(date);
        document.getElementById('travelDate').value = dateStr;
        document.getElementById('startDate').value = dateStr;
        document.getElementById('endDate').value = dateStr;

        // Update modal title
        document.getElementById('modalTitle').textContent = 'Add Travel Plan';

        modal.classList.add('active');
    }

    openEditModal(travel) {
        const modal = document.getElementById('travelModal');
        const form = document.getElementById('travelForm');
        
        this.editingTravelId = travel.id;

        // Fill form with existing data
        document.getElementById('travelDate').value = travel.date;
        document.getElementById('location').value = travel.location;
        document.getElementById('travelType').value = travel.type;
        document.getElementById('startDate').value = travel.startDate;
        document.getElementById('endDate').value = travel.endDate;
        document.getElementById('accommodation').value = travel.accommodation || '';
        document.getElementById('transportation').value = travel.transportation || '';
        document.getElementById('budget').value = travel.budget || '';
        document.getElementById('notes').value = travel.notes || '';

        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Travel Plan';

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('travelModal');
        modal.classList.remove('active');
        this.editingTravelId = null;
    }

    saveTravelPlan() {
        const travel = {
            id: this.editingTravelId || Date.now().toString(),
            date: document.getElementById('travelDate').value,
            location: document.getElementById('location').value,
            type: document.getElementById('travelType').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            accommodation: document.getElementById('accommodation').value,
            transportation: document.getElementById('transportation').value,
            budget: document.getElementById('budget').value,
            notes: document.getElementById('notes').value
        };

        if (this.editingTravelId) {
            // Update existing travel
            const index = this.travels.findIndex(t => t.id === this.editingTravelId);
            if (index !== -1) {
                this.travels[index] = travel;
            }
        } else {
            // Add new travel
            this.travels.push(travel);
        }

        this.saveTravels();
        this.closeModal();
        this.renderCalendar();
        this.renderTravelList();
    }

    deleteTravel(id) {
        if (confirm('Are you sure you want to delete this travel plan?')) {
            this.travels = this.travels.filter(t => t.id !== id);
            this.saveTravels();
            this.renderCalendar();
            this.renderTravelList();
        }
    }

    addToCalendar(id) {
        const travel = this.travels.find(t => t.id === id);
        if (!travel) return;

        const startDate = new Date(travel.startDate);
        const endDate = new Date(travel.endDate);
        
        // Google Calendar expects YYYYMMDD for all-day events
        // End date is exclusive for all-day events
        endDate.setDate(endDate.getDate() + 1);

        const format = (d) => {
            return d.toISOString().split('T')[0].replace(/-/g, '');
        };
        
        const startStr = format(startDate);
        const endStr = format(endDate);

        const title = encodeURIComponent(`Trip to ${travel.location}`);
        const details = encodeURIComponent(
            `Type: ${travel.type}\n` +
            `Accommodation: ${travel.accommodation || 'N/A'}\n` +
            `Transportation: ${travel.transportation || 'N/A'}\n` +
            `Notes: ${travel.notes || ''}`
        );
        const location = encodeURIComponent(travel.location);

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
        
        window.open(url, '_blank');
    }

    renderTravelList() {
        const travelList = document.getElementById('travelList');
        
        if (this.travels.length === 0) {
            travelList.innerHTML = '<p class="empty-state">No travel plans yet. Click on a date to add one!</p>';
            return;
        }

        // Sort travels by start date
        const sortedTravels = [...this.travels].sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
        );

        const typeEmojis = {
            vacation: '🏖️',
            business: '💼',
            adventure: '🏔️',
            cultural: '🎭',
            family: '👨‍👩‍👧‍👦',
            other: '✈️'
        };

        travelList.innerHTML = sortedTravels.map(travel => {
            const startDate = new Date(travel.startDate);
            const endDate = new Date(travel.endDate);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            return `
                <div class="travel-card">
                    <div class="travel-card-header">
                        <div class="travel-card-title">${typeEmojis[travel.type] || '✈️'} ${travel.location}</div>
                        <div class="travel-type-badge">${travel.type}</div>
                    </div>
                    <div class="travel-card-date">
                        📅 ${this.formatDateDisplay(travel.startDate)} - ${this.formatDateDisplay(travel.endDate)}
                        (${duration} day${duration > 1 ? 's' : ''})
                    </div>
                    <div class="travel-card-details">
                        ${travel.accommodation ? `🏨 ${travel.accommodation}` : ''}
                        ${travel.transportation ? `<div>🚗 ${travel.transportation}</div>` : ''}
                        ${travel.budget ? `<div>💰 $${travel.budget}</div>` : ''}
                        ${travel.notes ? `<div>📝 ${travel.notes}</div>` : ''}
                    </div>
                    <div class="travel-card-actions">
                        <button class="btn-small btn-edit" onclick="calendar.openEditModal(${JSON.stringify(travel).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="btn-small btn-calendar" onclick="calendar.addToCalendar('${travel.id}')">Sync to Calendar</button>
                        <button class="btn-small btn-delete" onclick="calendar.deleteTravel('${travel.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateDisplay(dateStr) {
        const date = new Date(dateStr);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    loadTravels() {
        const saved = localStorage.getItem('travelCalendar');
        return saved ? JSON.parse(saved) : [];
    }

    saveTravels() {
        localStorage.setItem('travelCalendar', JSON.stringify(this.travels));
    }
}

// Initialize the calendar
let calendar;
document.addEventListener('DOMContentLoaded', () => {
    calendar = new TravelCalendar();
});
