// Fetch and display timetable
fetch('schedule.json')
  .then(response => response.json())
  .then(events => {
    const container = document.getElementById('timetable-container');

    events.forEach(event => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.setAttribute('data-day', event.day);

      const isDeadline = event.type === 'deadline';
      const icon = isDeadline ? '⏰' : '📘';
      const time = isDeadline ? `By ${event.deadline}` : `${event.start} - ${event.end}`;
      const borderColor = isDeadline ? '#ff5e5e' : '#4cafef';

      card.innerHTML = `
        <div class="card-header" style="border-color:${borderColor}">
          <h3>${icon} ${event.event}</h3>
          <span class="day">${event.day}</span>
        </div>
        <div class="card-body">
          <p><strong>Type:</strong> ${isDeadline ? 'Deadline' : 'Fixed Event'}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
      `;

      container.appendChild(card);
    });

    // Filtering logic
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const day = btn.dataset.day;

        document.querySelectorAll('.card').forEach(card => {
          if (day === 'all' || card.dataset.day === day) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  })
  .catch(err => {
    document.getElementById('timetable-container').innerHTML =
      `<p class="error">❌ Unable to load schedule.json</p>`;
    console.error(err);
  });
