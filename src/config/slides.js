// PINTAARA - VERTICAL SLIDER CONFIGURATION
// You can easily update background images, slide themes, titles, and text contents here.
//
// CONCEPT IMAGES (from PINTAARA/Website concept/) are now in public/images/:
//   concept-enter.png      → Slide 1 – Dark stone + butterfly (Enter screen)
//   concept-philosophy.png → Slide 2 – Green crystal mountain (Philosophy)
//   concept-collection.png → Slide 3 – Robot pen drawing jewellery (Collection)
//   concept-banner.png     → Slide 4 – Butterfly pendant on grey rock (Banner)
//   concept-designlog.png  → Slide 5 – Pencil sketch to 3D jewel (Design Log)
//   concept-ourstory.png   → Slide 6 – Glowing mountain in clouds (Our Story)
//   concept-footer.png     → Slide 7 – Dark moody mountain (Footer)
//   concept-hero.png       → Alt hero (dark stone, wider crop)

export const ENTER_PAGE_CONFIG = {
    bgImage: "/images/concept-enter.png",
    bgPosition: "center",
    mobileBgImage: "/images/mobile/enter.jpg", // Website Design Mobile.pdf page 1
    title: "PINTAARA",
    buttonText: "ENTER"
};

export const PINTAARA_CONFIG = {
    // Show or hide the navigation header globally
    showHeader: true,

    // Slide Configuration (starting with Hero as Slide 1 of the slider)
    slides: [
        {
            id: "slide-2",
            bgImage: "/images/concept-hero12.png", // Golden particle butterfly — same artwork as Website Design.pdf page 2
            mobileBgImage: "/images/mobile/hero.jpg", // Website Design Mobile.pdf page 2
            mobileTitle: "FORMS THAT\nARRIVE ON\nTHEIR OWN\nTERMS.",
            bgPosition: "center",
            theme: "dark",
            headerStyle: "light",
            subtitle: "",
            title: "FORMS THAT ARRIVE ON\nTHEIR OWN TERMS.",
            desc: "",
            buttonText: "",
            buttonLink: ""
        },
        {
            id: "slide-3",
            bgImage: "", // Gradient applied via CSS
            contentImage: "/images/concept-collection2.png", // Rendered as <img> on right side — same artwork as Website Design.pdf page 3
            mobileBgImage: "/images/mobile/collection.jpg", // Website Design Mobile.pdf page 3
            desktopBgImage: "/images/desktop/collection.jpg", // Website Design.pdf page 3 (full-slide artwork)
            mobileTitle: "RARE FORMS.\nTIMELESS\nPRESENCE.",
            mobileDesc: "A collection of original designs\ncreated to carry identity,\nemotion, and presence. Some\nare inspired by stories. Others\nby the pursuit of a form that\nsimply deserved to exist.",
            mobileDescJustify: true,
            bgPosition: "right center",
            theme: "cream",
            headerStyle: "dark",
            headerReveal: true, // header shows on hover only (after the first slide)
            subtitle: "COLLECTION",
            title: "RARE FORMS.\nTIMELESS PRESENCE.",
            desc: "A collection of original designs created to carry identity, emotion, and presence. Some are inspired by stories. Others by the pursuit of a form that simply deserved to exist.",
            buttonText: "EXPLORE OUR COLLECTION",
            buttonLink: "/collection"
        },
        {
            id: "slide-4",
            bgImage: "", // Gradient applied via CSS
            contentImage: "/images/concept-designlog1.png", // Rendered as <img> on right side — same artwork as Website Design.pdf page 4
            mobileBgImage: "/images/mobile/design-log.jpg", // Website Design Mobile.pdf page 4
            desktopBgImage: "/images/desktop/design-log.jpg", // Website Design.pdf page 4 (full-slide artwork)
            mobileDesc: "Every piece begins long before\nit becomes jewellery.\n\nA record of original designs,\ndimensions and development\nbefore they become jewellery.",
            mobileDescJustify: true,
            bgPosition: "right center",
            theme: "dark",
            headerStyle: "light",
            headerReveal: true, // header shows on hover only (after the first slide)
            subtitle: "DESIGN LOG",
            title: "FROM FORM\nTO CREATION.",
            desc: "Every piece begins long before it becomes jewellery.\n\nA record of original designs, dimensions and development before they become jewellery.",
            buttonText: "EXPLORE OUR DESIGN LOG",
            buttonLink: "/design-log"
        },
        {
            id: "slide-5",
            bgImage: "", // Gradient applied via CSS
            contentImage: "/images/concept-philosophy.png", // Rendered as <img> on right side
            mobileBgImage: "/images/mobile/philosophy.jpg", // Website Design Mobile.pdf page 5
            desktopBgImage: "/images/desktop/philosophy.jpg", // Website Design.pdf page 5 (full-slide artwork)
            mobileTitle: "OTHERS FOLLOW\nWHAT ALREADY\nEXISTS.\nPINTAARA SEARCHES\nFOR FORMS THAT\nDON'T.",
            mobileDesc: "Originality begins with a\ndifferent question:\n\"What is yet to be explored?\"",
            bgPosition: "right center",
            theme: "olive",
            headerStyle: "dark",
            headerReveal: true, // header shows on hover only (after the first slide)
            subtitle: "PHILOSOPHY",
            title: "OTHERS FOLLOW WHAT\nALREADY EXISTS.\nPINTAARA SEARCHES FOR\nFORMS THAT DON'T.",
            desc: "Originality begins with a different question:\n\"What is yet to be explored?\"",
            buttonText: "READ MORE",
            buttonLink: "/about/philosophy"
        },
        {
            id: "slide-6",
            bgImage: "/images/about/story_mountain2.png", // Glowing green mountain peak – OUR STORY, same artwork as Website Design.pdf page 6
            mobileTitle: "THIS IS\nBECOMING.",
            mobileDesc: "Inspired by aspiration,\ntransformation and the pursuit\nof something greater than\noneself.",
            bgPosition: "center",
            theme: "dark",
            headerStyle: "light",
            headerReveal: true, // header shows on hover only (after the first slide)
            subtitle: "OUR STORY",
            title: "THIS IS BECOMING.",
            desc: "Inspired by aspiration, transformation and the\npursuit of something greater than oneself.",
            buttonText: "READ MORE",
            buttonLink: "/about/story"
        },
        {
            id: "slide-7",
            bgImage: "/images/concept-footer.png", // Dark moody mountain in fog – FOOTER
            bgPosition: "center",
            theme: "dark",
            headerStyle: "footer-only-icons",
            headerReveal: true, // logo + nav appear on hover; icons stay visible
            isFooter: true, // Special footer flag to render footer structure
            title: "THIS IS PINTAARA.",
            subtitle: "Rare. Intentional. Timeless."
        }
    ]
};
