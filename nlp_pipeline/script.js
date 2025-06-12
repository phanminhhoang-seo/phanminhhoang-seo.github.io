document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing NLP Pipeline with Looping Animation.');

    const container = document.querySelector('.pipeline-container');
    const svg = document.querySelector('.pipeline-lines');

    // Basic sanity checks for core elements
    if (!container) {
        console.error('Error: .pipeline-container not found in DOM. Aborting script.');
        return;
    }
    if (!svg) {
        console.error('Error: .pipeline-lines SVG not found in DOM. Aborting script.');
        return;
    }
    // console.log('Container and SVG elements found.');

    const label = document.querySelector('.deterministic-ranking-label');
    if (!label) {
        console.warn('.deterministic-ranking-label not found.');
    }

    // --- Helper Functions ---

    /**
     * Calculates the center coordinates of an HTML element relative to the SVG canvas.
     * @param {HTMLElement} el The element to get the center of.
     * @returns {{x: number, y: number}} An object with x and y coordinates relative to the SVG.
     */
    const getElementCenterSVGCoords = (el) => {
        if (!el) {
            // console.error('getElementCenterSVGCoords called with null element. Returning {0,0}.');
            return { x: 0, y: 0 };
        }
        const rect = el.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        return {
            x: (rect.left + rect.width / 2) - svgRect.left,
            y: (rect.top + rect.height / 2) - svgRect.top
        };
    };

    /**
     * Creates an SVG path element and adds it to the SVG.
     * @param {string} id The ID for the path.
     * @param {string} d The 'd' attribute string for the SVG path (path data).
     * @param {string} markerEndId The ID of the marker to use at the end of the path (e.g., 'arrowhead-marker').
     * @returns {SVGPathElement} The created path element.
     */
    const createSvgPath = (id, d, markerEndId) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); // Correct SVG namespace
        path.setAttribute('id', id);
        path.setAttribute('d', d);
        path.classList.add('pipeline-line');
        if (markerEndId) {
            path.setAttribute('marker-end', `url(#${markerEndId})`);
        }
        svg.appendChild(path);

        try {
            path.style.display = 'block'; // Ensure it's not hidden by default CSS
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            // console.log(`Path ${id} created with length ${length}`);
        } catch (e) {
            console.error(`Error calculating length for path ${id}:`, e);
            path.style.strokeDasharray = '0'; // Fallback
            path.style.strokeDashoffset = '0'; // Fallback
        }
        return path;
    };

    /**
     * Animates the drawing of an SVG path and applies the flow animation class.
     * @param {SVGPathElement} path The path element to animate.
     */
    const animatePathFlow = (path) => {
        if (!path) {
            // console.warn('animatePathFlow called with null path.');
            return;
        }
        // Temporarily remove transition to ensure instant reset (if called after reset)
        path.style.transition = 'none'; 
        void path.offsetWidth; // Force reflow
        path.style.strokeDashoffset = path.getTotalLength(); // Reset to fully undrawn
        path.style.opacity = 0.8; // Reset opacity

        // Re-apply transition for actual animation
        path.style.transition = 'stroke-dashoffset 1s ease-out, opacity 0.5s ease-out';
        path.style.strokeDashoffset = '0'; // Draw the line
        path.style.opacity = 1;
        path.classList.add('animate');

        // Also change marker color to match line animation
        const markerId = path.getAttribute('marker-end');
        if (markerId) {
            const markerElement = svg.querySelector(markerId.substring(4, markerId.length - 1));
            if (markerElement) {
                const arrowheadPath = markerElement.querySelector('.arrowhead');
                if (arrowheadPath) {
                    arrowheadPath.style.transition = 'fill 0.5s ease-in-out';
                    arrowheadPath.style.fill = 'var(--color-animated-line)';
                }
            }
        }
    };

    /**
     * Resets the color of an arrowhead to its default state.
     * @param {SVGPathElement} path The path element whose marker to reset.
     */
    const resetArrowheadColor = (path) => {
        const markerId = path.getAttribute('marker-end');
        if (markerId) {
            const markerElement = svg.querySelector(markerId.substring(4, markerId.length - 1));
            if (markerElement) {
                const arrowheadPath = markerElement.querySelector('.arrowhead');
                if (arrowheadPath) {
                    arrowheadPath.style.transition = 'fill 0.5s ease-in-out'; // Allow transition for reset
                    arrowheadPath.style.fill = 'var(--color-text-dark)'; // Default color
                }
            }
        }
    };

    /**
     * Fades in a given HTML element (its wrapper) with a slight pop-up effect.
     * @param {HTMLElement} elWrapper The wrapper element to fade in.
     * @param {number} delay The delay in milliseconds before starting the fade.
     * @returns {Promise<void>} A promise that resolves after the animation.
     */
    const fadeInElement = (elWrapper, delay = 200) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (elWrapper) {
                    // Temporarily remove transition for instant reset if needed
                    elWrapper.style.transition = 'none'; 
                    void elWrapper.offsetWidth; // Force reflow
                    elWrapper.style.opacity = 0; // Ensure starts from hidden
                    elWrapper.style.transform = 'translateY(20px)'; // Ensure starts from offset

                    // Re-apply transition for actual animation
                    elWrapper.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                    elWrapper.style.opacity = 1;
                    elWrapper.style.transform = 'translateY(0)';
                    elWrapper.classList.add('faded-in');
                }
                resolve();
            }, delay);
        });
    };

    /**
     * Resets the state of all elements to their initial hidden state.
     */
    const resetPipeline = () => {
        // console.log('Resetting pipeline for next loop cycle...');
        const allWrappers = document.querySelectorAll('.pipeline-stage-wrapper');
        const allPaths = document.querySelectorAll('.pipeline-line');
        const allArrowheads = svg.querySelectorAll('.arrowhead');

        allWrappers.forEach(wrapper => {
            wrapper.style.transition = 'none'; // Instant reset
            wrapper.style.opacity = 0;
            wrapper.style.transform = 'translateY(20px)';
            wrapper.classList.remove('faded-in');
            void wrapper.offsetWidth; // Force reflow
        });

        allPaths.forEach(path => {
            path.style.transition = 'none'; // Instant reset
            const length = path.getTotalLength();
            path.style.strokeDashoffset = length;
            path.style.opacity = 0.8;
            path.classList.remove('animate');
            void path.offsetWidth; // Force reflow
            resetArrowheadColor(path); // Reset individual arrowhead color
        });

        // Reset label
        label.style.transition = 'none';
        label.style.opacity = 0;
        label.style.transform = 'translateY(30px)';
        void label.offsetWidth; // Force reflow

        // Re-enable transitions after reset
        setTimeout(() => {
            allWrappers.forEach(wrapper => {
                wrapper.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            });
            allPaths.forEach(path => {
                path.style.transition = 'stroke-dashoffset 1s ease-out, opacity 0.5s ease-out';
            });
            label.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        }, 50); // Small delay to allow reflow before re-enabling transitions
    };

    /**
     * Creates an SVG <defs> section and a marker for arrowheads.
     * This marker can be reused for all paths.
     */
    const createArrowheadMarker = () => {
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.appendChild(defs);
        }

        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead-marker');
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerUnits', 'strokeWidth');
        marker.setAttribute('markerWidth', '6');
        marker.setAttribute('markerHeight', '6');
        marker.setAttribute('orient', 'auto');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        path.classList.add('arrowhead'); // For CSS styling
        marker.appendChild(path);
        defs.appendChild(marker);
    };

    // --- Drawing all static SVG lines ---
    const drawAllLines = () => {
        // console.log('Starting drawAllLines...');
        svg.innerHTML = ''; // Clear existing lines
        createArrowheadMarker(); // Recreate marker on redraw

        // Get references to the specific box elements
        const docBox = document.getElementById('box-document');
        const parsingBox = document.getElementById('box-document-parsing');
        const segmentAnnoBox = document.getElementById('box-segment-annotation');
        const tokenizationBox = document.getElementById('box-tokenization');
        const tokenIndexingBox = document.getElementById('box-token-indexing');
        const elementAnnotationBox = document.getElementById('box-element-annotation');
        const textSegmentationBox = document.getElementById('box-text-segmentation');
        const generateEmbeddingsBox = document.getElementById('box-generate-embeddings');
        const vectorIndexingBox = document.getElementById('box-vector-indexing');
        const searchBox = document.getElementById('box-search');
        const rankingBox = document.getElementById('box-ranking');

        // Verify all required elements are present. If any are null, stop.
        const elements = {
            docBox, parsingBox, segmentAnnoBox, tokenizationBox, tokenIndexingBox,
            elementAnnotationBox, textSegmentationBox, generateEmbeddingsBox,
            vectorIndexingBox, searchBox, rankingBox
        };

        for (const [name, el] of Object.entries(elements)) {
            if (!el) {
                console.error(`Missing element: ${name}. Cannot draw lines. Check its ID in HTML.`);
                return;
            }
        }

        const C = getElementCenterSVGCoords;

        // Line 1: Document -> Document Parsing
        createSvgPath('line-doc-parsing', `M${C(docBox).x},${C(docBox).y} L${C(parsingBox).x},${C(parsingBox).y}`, 'arrowhead-marker');

        // Line 2: Document Parsing -> Segment-Level Annotation
        createSvgPath('line-parsing-segment', `M${C(parsingBox).x},${C(parsingBox).y} L${C(segmentAnnoBox).x},${C(segmentAnnoBox).y}`, 'arrowhead-marker');

        // Line 3 (Branching): Segment-Level Annotation -> Tokenization (Top Path)
        // Path goes right from segmentAnno, then up to Tokenization
        createSvgPath('line-segment-tokenization',
            `M${C(segmentAnnoBox).x},${C(segmentAnnoBox).y} ` +
            `L${C(tokenizationBox).x - 100},${C(segmentAnnoBox).y} ` + // Horizontal to the left of tokenization
            `L${C(tokenizationBox).x - 100},${C(tokenizationBox).y} ` + // Vertical up to tokenization level
            `L${C(tokenizationBox).x},${C(tokenizationBox).y}`, // Horizontal to tokenization
            'arrowhead-marker'
        );

        // Line 4 (Branching): Segment-Level Annotation -> Element-Level Annotation (Bottom Path)
        // Path goes right from segmentAnno, then down to Element Annotation
        createSvgPath('line-segment-element',
            `M${C(segmentAnnoBox).x},${C(segmentAnnoBox).y} ` +
            `L${C(elementAnnotationBox).x - 100},${C(segmentAnnoBox).y} ` + // Horizontal to the left of element annotation
            `L${C(elementAnnotationBox).x - 100},${C(elementAnnotationBox).y} ` + // Vertical down to element annotation level
            `L${C(elementAnnotationBox).x},${C(elementAnnotationBox).y}`, // Horizontal to element annotation
            'arrowhead-marker'
        );

        // Line 5: Tokenization -> Token Indexing
        createSvgPath('line-token-indexing', `M${C(tokenizationBox).x},${C(tokenizationBox).y} L${C(tokenIndexingBox).x},${C(tokenIndexingBox).y}`, 'arrowhead-marker');

        // Line 6: Element-Level Annotation -> Text Segmentation
        createSvgPath('line-element-text', `M${C(elementAnnotationBox).x},${C(elementAnnotationBox).y} L${C(textSegmentationBox).x},${C(textSegmentationBox).y}`, 'arrowhead-marker');

        // Line 7: Text Segmentation -> Generate Embeddings
        createSvgPath('line-text-embeddings', `M${C(textSegmentationBox).x},${C(textSegmentationBox).y} L${C(generateEmbeddingsBox).x},${C(generateEmbeddingsBox).y}`, 'arrowhead-marker');

        // Line 8: Generate Embeddings -> Vector Indexing
        createSvgPath('line-embeddings-vector', `M${C(generateEmbeddingsBox).x},${C(generateEmbeddingsBox).y} L${C(vectorIndexingBox).x},${C(vectorIndexingBox).y}`, 'arrowhead-marker');

        // Line 9 (Loop Back): Text Segmentation -> Segment-Level Annotation (Complex Curve)
        const tsCenter = C(textSegmentationBox);
        const saCenter = C(segmentAnnoBox);
        const controlPointOffset = 100; // How much the curve bends

        createSvgPath('line-loop-back',
            `M${tsCenter.x},${tsCenter.y} ` +
            `C${tsCenter.x + controlPointOffset},${tsCenter.y + controlPointOffset} ` + // Control point 1 (down and right)
            `${saCenter.x + controlPointOffset},${saCenter.y + controlPointOffset} ` + // Control point 2 (up and right)
            `${saCenter.x},${saCenter.y}`, // End point
            'arrowhead-marker'
        );

        // Line 10 (Convergence): Token Indexing -> Search
        createSvgPath('line-token-search', `M${C(tokenIndexingBox).x},${C(tokenIndexingBox).y} L${C(searchBox).x},${C(searchBox).y}`, 'arrowhead-marker');

        // Line 11 (Convergence): Vector Indexing -> Search
        createSvgPath('line-vector-search', `M${C(vectorIndexingBox).x},${C(vectorIndexingBox).y} L${C(searchBox).x},${C(searchBox).y}`, 'arrowhead-marker');

        // Line 12: Search -> Ranking
        createSvgPath('line-search-ranking', `M${C(searchBox).x},${C(searchBox).y} L${C(rankingBox).x},${C(rankingBox).y}`, 'arrowhead-marker');
    };

    // --- Animation Sequence ---
    const animatePipeline = async () => {
        console.log('Starting pipeline animation cycle.');
        const shortDelay = 200; // Delay between box appearances
        const longDelay = 600; // Delay after a stage is complete

        const getWrapperById = (id) => document.getElementById(id);
        const getPathById = (id) => document.getElementById(id);

        const steps = [
            { wrapper: getWrapperById('stage-wrapper-document') },
            { wrapper: getWrapperById('stage-wrapper-parsing'), path: getPathById('line-doc-parsing') },
            { wrapper: getWrapperById('stage-wrapper-segment-annotation'), path: getPathById('line-parsing-segment') },
            { path: getPathById('line-segment-tokenization') },
            { wrapper: getWrapperById('stage-wrapper-tokenization') },
            { wrapper: getWrapperById('stage-wrapper-token-indexing'), path: getPathById('line-token-indexing') },
            { path: getPathById('line-segment-element') },
            { wrapper: getWrapperById('stage-wrapper-element-annotation') },
            { wrapper: getWrapperById('stage-wrapper-text-segmentation'), path: getPathById('line-element-text') },
            { path: getPathById('line-loop-back') },
            { wrapper: getWrapperById('stage-wrapper-generate-embeddings'), path: getPathById('line-text-embeddings') },
            { wrapper: getWrapperById('stage-wrapper-vector-indexing'), path: getPathById('line-embeddings-vector') },
            { wrapper: getWrapperById('stage-wrapper-search'), path: getPathById('line-token-search'), path2: getPathById('line-vector-search') },
            { wrapper: getWrapperById('stage-wrapper-ranking'), path: getPathById('line-search-ranking') }
        ];

        for (const step of steps) {
            if (step.wrapper) {
                await fadeInElement(step.wrapper, shortDelay);
            }
            if (step.path) {
                animatePathFlow(step.path);
            }
            if (step.path2) {
                animatePathFlow(step.path2);
            }
            await new Promise(r => setTimeout(r, longDelay));
        }

        await fadeInElement(label, shortDelay);
        await new Promise(r => setTimeout(r, longDelay * 2)); // Long pause at the end

        console.log('Pipeline animation cycle finished. Preparing for next loop.');

        resetPipeline();

        await new Promise(r => setTimeout(r, 1000)); // Pause after reset before new cycle
        animatePipeline(); // Loop the animation
    };

    // --- Initialization ---
    const resizeSVG = () => {
        const gridWrapper = document.querySelector('.pipeline-flow-grid');
        if (!gridWrapper) {
            console.error('.pipeline-flow-grid not found during SVG resize.');
            return;
        }
        const gridRect = gridWrapper.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        svg.style.width = `${gridRect.width}px`;
        svg.style.height = `${gridRect.height}px`;
        svg.style.left = `${gridRect.left - containerRect.left}px`;
        svg.style.top = `${gridRect.top - containerRect.top}px`;
    };

    // Initial setup: Draw all SVG lines before starting animation
    try {
        resizeSVG();
        drawAllLines();
    } catch (e) {
        console.error('Error during initial drawing of SVG lines:', e);
    }

    // Start the animation sequence, which will then loop
    animatePipeline();

    // Redraw lines on window resize to maintain connections
    let resizeTimer;
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) { // Match CSS media query breakpoint
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('Window resized, redrawing lines...');
                resizeSVG();
                drawAllLines(); // Redraw all lines

                // Reset and re-apply animations for paths that should loop
                resetPipeline(); // Reset all elements
                // The main animatePipeline loop will restart animations from the beginning
            }, 250);
        } else {
            svg.style.display = 'none'; // Hide SVG on small screens
        }
    });

    // Handle initial small screen behavior (if page loads on small screen)
    if (window.innerWidth <= 992) {
        svg.style.display = 'none';
    }
});
