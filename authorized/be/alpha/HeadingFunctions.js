// Toggle heading dropdown with anchor tag

// (function headingToggleWithAnchor() {
//     const headings = document.querySelectorAll('h2.storyHead')
//     const headingThree = document.querySelectorAll('h3.storyHead')
//     console.log('headings', headings);
//
//     Array.prototype.forEach.call(headings, heading => {
//         let link = heading.querySelector('a')
//         let target = heading.nextElementSibling
//             link.onclick = () => {
//                 let expanded = link.getAttribute('aria-expanded') === 'true' || false
//
//                 link.setAttribute('aria-expanded', !expanded)
//                 target.hidden = expanded
//             }
//
//     })
//     Nested Dropdown of H3
//     Array.prototype.forEach.call(headingThree, heading => {
//         let linkThree = heading.querySelector('a')
//         let targetThree = heading.nextElementSibling
//
//         linkThree.onclick = () => {
//             let expanded = linkThree.getAttribute('aria-expanded') === 'true' || false
//
//             linkThree.setAttribute('aria-expanded', !expanded)
//             targetThree.hidden = expanded
//         }
//     })
// })()

// (function headingToggleWithButton() {
//     const headings = document.querySelectorAll('h2.storyHead')
//     const headingThree = document.querySelectorAll('h3.storyHead')
//
//     Array.prototype.forEach.call(headings, heading => {
//         let btn = heading.querySelector('button')
//         let target = heading.nextElementSibling
//
//
//         btn.onclick = () => {
//             let expanded = btn.getAttribute('aria-expanded') === 'true' || false
//
//             btn.setAttribute('aria-expanded', !expanded)
//             target.hidden = expanded
//         }
//     })
//     // Nested Dropdown of H3
//     Array.prototype.forEach.call(headingThree, heading => {
//         let btnThree = heading.querySelector('button')
//         let targetThree = heading.nextElementSibling
//
//         btnThree.onclick = () => {
//             let expanded = btnThree.getAttribute('aria-expanded') === 'true' || false
//
//             btnThree.setAttribute('aria-expanded', !expanded)
//             targetThree.hidden = expanded
//         }
//     })
// })()

// Heading drops down whether the heading child is a button or anchor. As it iterates through the nodelist, checks if the child is either a button or anchor and event takes places depending on heading child.
(function headingToggle() {
    const headings = document.querySelectorAll('.storyHead')
    // const headingThree = document.querySelectorAll('h3.storyHead')

    Array.prototype.forEach.call(headings, heading => {
        let btn = heading.querySelector('button')
        let link = heading.querySelector('a')
        let target = heading.nextElementSibling

        if (btn != null) {
            btn.onclick = () => {
                let expanded = btn.getAttribute('aria-expanded') === 'true' || false

                btn.setAttribute('aria-expanded', !expanded)
                target.hidden = expanded
            }
        } else if (link != null) {
            link.onclick = () => {
                let expanded = link.getAttribute('aria-expanded') === 'true' || false

                link.setAttribute('aria-expanded', !expanded)
                target.hidden = expanded
            }
        }
    })
})()




// Open Dropdown Function
// iterates over headings, traverses through node tree to check if nested anchor tags have class 'selected', if so, looks for if parent div is expanded or hidden,
// if hidden, will open parent div. This is set up to check on keydown of comma or period button while keying through slides.
function openSelectedParent() {
    const headings = document.querySelectorAll('.storyHead')

    Array.prototype.forEach.call(headings, heading => {
        let btn = heading.querySelector('button');
        let link = heading.querySelector('a');
        let parentDiv = heading.nextElementSibling;
        let targetedElm = parentDiv.querySelectorAll('a');

        Array.prototype.forEach.call(targetedElm, target => {
            if (target.classList.contains('selected')){
                if (btn != null) {
                    let hiddenDiv = btn.getAttribute('aria-expanded') === false

                    btn.setAttribute('aria-expanded', !hiddenDiv)
                     parentDiv.hidden = hiddenDiv
                } else if  (link != null) {
                    let hiddenDiv = link.getAttribute('aria-expanded') === false

                    link.setAttribute('aria-expanded', !hiddenDiv)
                    parentDiv.hidden = hiddenDiv
                    }
            }
        })
    });

};

// triggers openSelectedParent function on keydown of (',' 188), ('.' 190), ('page up', 33), ('page down', 34), ('home', 35), ('end', 36), ('shiftkey & ,' shiftkey & 188), ('shiftkey & .' shiftkey & 190)
$(window).keydown(function(e) {
    if (e.keyCode == 188 ||
        e.keyCode == 190 ||
        e.keyCode == 33 ||
        e.keyCode == 34 ||
        e.keyCode == 35 ||
        e.keyCode == 36 ||
        (e.shiftKey && e.keyCode == 188) ||
        (e.shiftKey && e.keyCode == 190)
    ) {
        openSelectedParent();
    }
});