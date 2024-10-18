const mainContainer = document.querySelector(".main-container"),
    imagePreview = document.querySelectorAll(".image-preview"),
    image = document.querySelectorAll(".image-preview img"),
    video = document.querySelectorAll("video");

window.onload = () => {
    const setOpacity = (opacity) => image.forEach(img => img.style.opacity = opacity);
    mainContainer.onmouseenter = () => setOpacity(0.2);
    mainContainer.onmouseleave = () => setOpacity(1);

    gsap.fromTo(imagePreview, 
        { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", opacity: 0 },
        { duration: 1.5, clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0 100%)", opacity: 1, stagger: 0.2, ease: "power2.out" }
    );

    imagePreview.forEach((preview, index) => {
        const expandCard = (flexValue) => gsap.to(preview, { duration: 0.1, flex: flexValue, ease: "power2.inOut" });
        preview.onmouseenter = () => { expandCard(2); video[index].play(); };
        preview.onmouseleave = () => { expandCard(1); video[index].pause(); };
    });
};
