// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentElement;
        accordionItem.classList.toggle('active');
    });
});

// Icon replacement on click
const icons = ['drone.png', '3d.png', 'gamecontroller.png', 'solderiron.png', 'shroom.png'];

function updateDroneAnimation(icon) {
    const currentSrc = icon.src.split('/').pop();
    if (currentSrc === 'drone.png') {
        icon.style.animation = 'droneTurn 10s ease-in-out infinite';
    } else {
        icon.style.animation = '';
    }
}

document.querySelectorAll('.float-icon').forEach((icon, index) => {
    icon.style.cursor = 'pointer';
    icon.style.pointerEvents = 'auto';

    // Initial animation check
    updateDroneAnimation(icon);

    icon.addEventListener('click', (e) => {
        const currentSrc = icon.src.split('/').pop();
        const availableIcons = icons.filter(i => i !== currentSrc);
        const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];
        icon.src = `img/icons/${randomIcon}`;

        // Update animation after icon change
        updateDroneAnimation(icon);
    });
});
