document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Starting NLP Pipeline initialization process...');

    const container = document.querySelector('.pipeline-container');
    const svg = document.querySelector('.pipeline-lines');
    const pipelineFlowGrid = document.querySelector('.pipeline-flow-grid');

    if (!container || !svg || !pipelineFlowGrid) {
        console.error('CRITICAL ERROR: Essential DOM elements (container, svg, or pipelineFlowGrid) not found. Aborting script.');
        return;
    }

    const label = document.querySelector('.deterministic-ranking-label');
    if (!label) {
        console.warn('.deterministic-ranking-label not found.');
    }

    // --- Zoom variables ---
    let currentZoom = 1.0;
    const zoomStep = 0.1;
    const minZoom = 0.5;
    const maxZoom = 2.0;

    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');

    if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
        zoomInBtn.addEventListener('click', () => adjustZoom(zoomStep));
        zoomOutBtn.addEventListener('click', () => adjustZoom(-zoomStep));
        zoomResetBtn.addEventListener('click', () => adjustZoom(1.0, true)); // true to reset
    } else {
        // console.warn('Zoom control buttons not found. Zoom functionality will be disabled.');
    }

    // --- Helper Functions ---

    /**
     * Adjusts the zoom level of the pipeline.
     * @param {number} delta The amount to change zoom by (e.g., 0.1 for zoom in, -0.1 for zoom out).
     * @param {boolean} reset If true, resets zoom to 1.0.
     */
    const adjustZoom = (delta, reset = false) => {
        if (window.innerWidth <= 992) { 
            return; // Zoom disabled on small screens
        }

        if (reset) {
            currentZoom = 1.0;
        } else {
            currentZoom += delta;
            currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom)); // Clamp zoom
        }

        pipelineFlowGrid.style.transform = `scale(${currentZoom})`;

        stopAnimation(); // Stop any ongoing animation cycle
        resetPipeline(); // Reset elements for a clean restart

        // Re-calculate and redraw after zoom
        setTimeout(() => { // Small delay to allow CSS transform to apply
            resizeSVG();
            drawAllLines(); // Redraw lines based on new zoom
            animatePipeline(); // Restart animation
        }, 300); // Allow transform to apply
        
        console.log(`Zoom adjusted to: ${currentZoom}`);
    };

    /**
     * Calculates the center coordinates of an HTML element relative to the SVG canvas.
     * Checks if element has valid dimensions.
     * @param {HTMLElement} el The element to get the center of.
     * @returns {{x: number, y: number}|null} An object with x and y coordinates relative to the SVG, or null if invalid.
     */
    const getElementCenterSVGCoords = (el) => {
        if (!el) {
            console.error('getElementCenterSVGCoords called with null element.');
            return null;
        }
        const rect = el.getBoundingClientRect();
        // Crucial check: if width/height is 0, element is not laid out correctly (e.g., display: none outside media query)
        if (rect.width === 0 || rect.height === 0) {
            // console.warn(`Element ${el.id || el.className} has zero dimensions. Layout might not be ready.`);
            return null;
        }
        const svgRect = svg.getBoundingClientRect();
        return {
            x: (rect.left + rect.width / 2) - svgRect.left,
            y: (rect.top + rect.height / 2) - svgRect.top
        };
    };

    /**
     * Creates an SVG path element and adds it to the SVG.
     * @returns {SVGPathElement|null} The created path element, or null if creation failed.
     */
    const createSvgPath = (id, d, markerEndId) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', id);
        path.setAttribute('d', d);
        path.classList.add('pipeline-line');
        if (markerEndId) {
            path.setAttribute('marker-end', `url(#${markerEndId})`);
        }
        svg.appendChild(path);

        try {
            // Temporarily make it block to get length if it's hidden by CSS
            // This is especially for getTotalLength which fails on hidden elements
            const originalDisplay = path.style.display;
            path.style.display = 'block'; 
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.style.display = originalDisplay; // Restore original display
            return path;
        } catch (e) {
            console.error(`Error calculating length for path ${id} with d="${d}":`, e);
            if (path.parentNode === svg) { // Check if path is still in SVG before trying to remove
                svg.removeChild(path); // Remove invalid path to prevent visual artifacts
            }
            return null;
        }
    };

    /**
     * Animates the drawing of an SVG path and applies the flow animation class.
     */
    const animatePathFlow = (path) => {
        if (!path) return;
        
        // Reset path state for animation (ensure it's completely hidden then redrawn)
        path.style.transition = 'none'; 
        void path.offsetWidth; // Force reflow
        path.style.strokeDashoffset = path.getTotalLength(); 
        path.style.opacity = window.innerWidth > 992 ? 0.8 : 0.7; // Initial opacity based on screen size

        // Start path drawing animation
        path.style.transition = 'stroke-dashoffset 1s ease-out, opacity 0.5s ease-out';
        path.style.strokeDashoffset = '0'; // Draw the line
        path.style.opacity = 1;
        path.classList.add('animate');

        // Directly change arrowhead color using JS
        const markerId = path.getAttribute('marker-end');
        if (markerId) {
            const markerElement = svg.querySelector(markerId.substring(4, markerId.length - 1));
            if (markerElement) {
                const arrowheadPath = markerElement.querySelector('.arrowhead');
                if (arrowheadPath) {
                    arrowheadPath.style.transition = 'fill 0.5s ease-in-out';
                    // Apply animated color on desktop, or keep default on mobile
                    arrowheadPath.style.fill = window.innerWidth > 992 ? 'var(--color-animated-line)' : 'var(--color-text-dark)'; 
                }
            }
        }
    };

    /**
     * Resets the color of an arrowhead to its default state.
     */
    const resetArrowheadColor = (path) => {
        const markerId = path.getAttribute('marker-end');
        if (markerId) {
            const markerElement = svg.querySelector(markerId.substring(4, markerId.length - 1));
            if (markerElement) {
                const arrowheadPath = markerElement.querySelector('.arrowhead');
                if (arrowheadPath) {
                    arrowheadPath.style.transition = 'fill 0.5s ease-in-out'; // Allow transition for reset
                    arrowheadPath.style.fill = 'var(--color-text-dark)'; // Reset to default color
                }
            }
        }
    };

    /**
     * Fades in a given HTML element (its wrapper) with a slight pop-up effect.
     */
    const fadeInElement = (elWrapper, delay = 200) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (elWrapper) {
                    // Force reset properties for instant hidden state before re-animating
                    elWrapper.style.transition = 'none'; 
                    void elWrapper.offsetWidth; // Force reflow
                    elWrapper.style.opacity = 0; 
                    elWrapper.style.transform = 'translateY(20px)';

                    // Re-apply transition and animate
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
        const allWrappers = document.querySelectorAll('.pipeline-stage-wrapper');
        const allPaths = document.querySelectorAll('.pipeline-line');

        allWrappers.forEach(wrapper => {
            wrapper.style.transition = 'none'; 
            wrapper.style.opacity = 0;
            wrapper.style.transform = 'translateY(20px)';
            wrapper.classList.remove('faded-in');
            void wrapper.offsetWidth; 
        });

        allPaths.forEach(path => {
            path.style.transition = 'none'; 
            // getTotalLength might fail if path is invalid or display:none is forced externally
            try {
                const length = path.getTotalLength();
                path.style.strokeDashoffset = length;
            } catch (e) {
                console.warn(`Error getting length for path ${path.id} during reset:`, e);
                path.style.strokeDashoffset = '0'; // Fallback
            }
            path.style.opacity = window.innerWidth > 992 ? 0.8 : 0.7; 
            path.classList.remove('animate');
            void path.offsetWidth; 
            resetArrowheadColor(path); 
        });

        label.style.transition = 'none';
        label.style.opacity = 0;
        label.style.transform = 'translateY(30px)';
        void label.offsetWidth;

        setTimeout(() => {
            allWrappers.forEach(wrapper => {
                wrapper.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            });
            allPaths.forEach(path => {
                path.style.transition = 'stroke-dashoffset 1s ease-out, opacity 0.5s ease-out';
            });
            label.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        }, 50);
    };

    /**
     * Creates an SVG <defs> section and a marker for arrowheads.
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
        path.classList.add('arrowhead'); 
        marker.appendChild(path);
        defs.appendChild(marker);
    };

    /**
     * Draws all the SVG lines connecting the pipeline boxes.
     * Logic changes based on screen size (desktop vs mobile).
     * Includes retry mechanism for layout stability.
     */
    const drawAllLines = (retryCount = 0) => {
        const MAX_RETRY = 5;
        // console.log(`Attempting to draw lines (retry ${retryCount})...`);

        svg.innerHTML = ''; // Clear existing lines
        createArrowheadMarker(); // Recreate marker on redraw

        // Get references to the specific box elements by their IDs
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

        // --- Crucial check for element dimensions and layout stability ---
        const elementsToCheck = [
            docBox, parsingBox, segmentAnnoBox, tokenizationBox, tokenIndexingBox,
            elementAnnotationBox, textSegmentationBox, generateEmbeddingsBox,
            vectorIndexingBox, searchBox, rankingBox
        ];

        let allElementsValid = true;
        const coords = {};
        elementsToCheck.forEach(el => {
            if (!el) { // Check if element exists in DOM
                console.error(`Required element is null: ${el}. Cannot calculate coordinates.`);
                allElementsValid = false;
                return;
            }
            const center = getElementCenterSVGCoords(el); // Get coordinates and check dimensions
            if (!center) { // If element has zero dimensions (not laid out yet)
                allElementsValid = false;
                console.warn(`Element ${el.id} has invalid dimensions (${el.getBoundingClientRect().width}x${el.getBoundingClientRect().height}).`);
                return;
            }
            coords[el.id] = center;
        });

        if (!allElementsValid && retryCount < MAX_RETRY) {
            console.warn(`Layout not stable. Retrying drawAllLines in 100ms. (Retry: ${retryCount + 1}/${MAX_RETRY})`);
            setTimeout(() => drawAllLines(retryCount + 1), 100);
            return; // Exit current call, retry later
        } else if (!allElementsValid && retryCount >= MAX_RETRY) {
            console.error('Failed to draw lines after multiple retries. Elements likely not laid out correctly.');
            stopAnimation(); // Stop animation loop if fundamental layout fails
            resetPipeline(); // Ensure elements are reset
            return;
        }
        console.log('All elements have valid dimensions. Proceeding with drawing.');

        // --- Actual Drawing Logic ---
        const isSmallScreen = window.innerWidth <= 992; // Re-check screen size for drawing logic

        if (!isSmallScreen) { // Desktop/Large Screen Logic (Grid Layout)
            createSvgPath('line-doc-parsing', `M${coords.box-document.x},${coords.box-document.y} L${coords.box-document-parsing.x},${coords.box-document-parsing.y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment', `M${coords['box-document-parsing'].x},${coords['box-document-parsing'].y} L${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y}`, 'arrowhead-marker');

            createSvgPath('line-segment-tokenization',
                `M${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y} ` +
                `L${coords['box-tokenization'].x - 100},${coords['box-segment-annotation'].y} ` + // Horizontal to the left of tokenization
                `L${coords['box-tokenization'].x - 100},${coords['box-tokenization'].y} ` + // Vertical up to tokenization level
                `L${coords['box-tokenization'].x},${coords['box-tokenization'].y}`, // Horizontal to tokenization
                'arrowhead-marker'
            );

            createSvgPath('line-segment-element',
                `M${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y} ` +
                `L${coords['box-element-annotation'].x - 100},${coords['box-segment-annotation'].y} ` + // Horizontal to the left of element annotation
                `L${coords['box-element-annotation'].x - 100},${coords['box-element-annotation'].y} ` + // Vertical down to element annotation level
                `L${coords['box-element-annotation'].x},${coords['box-element-annotation'].y}`, // Horizontal to element annotation
                'arrowhead-marker'
            );

            createSvgPath('line-token-indexing', `M${coords['box-tokenization'].x},${coords['box-tokenization'].y} L${coords['box-token-indexing'].x},${coords['box-token-indexing'].y}`, 'arrowhead-marker');
            createSvgPath('line-element-text', `M${coords['box-element-annotation'].x},${coords['box-element-annotation'].y} L${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings', `M${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y} L${coords['box-generate-embeddings'].x},${coords['box-generate-embeddings'].y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector', `M${coords['box-generate-embeddings'].x},${coords['box-generate-embeddings'].y} L${coords['box-vector-indexing'].x},${coords['box-vector-indexing'].y}`, 'arrowhead-marker');

            const controlPointOffset = 100; // How much the curve bends
            createSvgPath('line-loop-back',
                `M${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y} ` +
                `C${coords['box-text-segmentation'].x + controlPointOffset},${coords['box-text-segmentation'].y + controlPointOffset} ` + // Control point 1 (down and right)
                `${coords['box-segment-annotation'].x + controlPointOffset},${coords['box-segment-annotation'].y + controlPointOffset} ` + // Control point 2 (up and right)
                `${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y}`, // End point
                'arrowhead-marker'
            );

            createSvgPath('line-token-search', `M${coords['box-token-indexing'].x},${coords['box-token-indexing'].y} L${coords['box-search'].x},${coords['box-search'].y}`, 'arrowhead-marker');
            createSvgPath('line-vector-search', `M${coords['box-vector-indexing'].x},${coords['box-vector-indexing'].y} L${coords['box-search'].x},${coords['box-search'].y}`, 'arrowhead-marker');

            createSvgPath('line-search-ranking', `M${coords['box-search'].x},${coords['box-search'].y} L${coords['box-ranking'].x},${coords['box-ranking'].y}`, 'arrowhead-marker');

        } else { // Mobile/Small Screen Logic (Vertical Stack Layout) - Simplified Paths
            createSvgPath('line-doc-parsing-mobile', `M${coords['box-document'].x},${coords['box-document'].y} L${coords['box-document-parsing'].x},${coords['box-document-parsing'].y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment-mobile', `M${coords['box-document-parsing'].x},${coords['box-document-parsing'].y} L${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y}`, 'arrowhead-marker');
            
            createSvgPath('line-segment-tokenization-mobile', `M${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y} L${coords['box-tokenization'].x},${coords['box-tokenization'].y}`, 'arrowhead-marker');
            createSvgPath('line-token-indexing-mobile', `M${coords['box-tokenization'].x},${coords['box-tokenization'].y} L${coords['box-token-indexing'].x},${coords['box-token-indexing'].y}`, 'arrowhead-marker');
            
            createSvgPath('line-token-search-mobile', `M${coords['box-token-indexing'].x},${coords['box-token-indexing'].y} L${coords['box-search'].x},${coords['box-search'].y}`, 'arrowhead-marker');
            
            createSvgPath('line-segment-element-mobile', `M${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y} L${coords['box-element-annotation'].x},${coords['box-element-annotation'].y}`, 'arrowhead-marker');
            createSvgPath('line-element-text-mobile', `M${coords['box-element-annotation'].x},${coords['box-element-annotation'].y} L${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings-mobile', `M${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y} L${coords['box-generate-embeddings'].x},${coords['box-generate-embeddings'].y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector-mobile', `M${coords['box-generate-embeddings'].x},${coords['box-generate-embeddings'].y} L${coords['box-vector-indexing'].x},${coords['box-vector-indexing'].y}`, 'arrowhead-marker');

            createSvgPath('line-loop-back-mobile', 
                `M${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y} ` +
                `L${coords['box-text-segmentation'].x},${coords['box-segment-annotation'].y + 100} ` +
                `L${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y + 100} ` +
                `L${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-vector-search-mobile', `M${coords['box-vector-indexing'].x},${coords['box-vector-indexing'].y} L${coords['box-search'].x},${coords['box-search'].y}`, 'arrowhead-marker');
            createSvgPath('line-search-ranking-mobile', `M${coords['box-search'].x},${coords['box-search'].y} L${coords['box-ranking'].x},${coords['box-ranking'].y}`, 'arrowhead-marker');
        }
        // console.log('Finished drawAllLines attempt.');
    };

    // --- Animation Sequence ---
    let animationRunning = false; 
    let animationTimeoutId = null; 

    const animatePipeline = async () => {
        if (animationRunning) {
            // console.log('Animation already running, skipping start.');
            return; 
        }
        animationRunning = true;
        console.log('Starting pipeline animation cycle.');
        const shortDelay = 200;
        const longDelay = 600;
        const isSmallScreen = window.innerWidth <= 992;

        const getWrapperById = (id) => document.getElementById(id);
        const getPathById = (id) => document.getElementById(id);

        let steps;
        if (!isSmallScreen) { // Desktop Order
            steps = [
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
        } else { // Mobile Order (simplified vertical flow)
            steps = [
                { wrapper: getWrapperById('stage-wrapper-document') },
                { wrapper: getWrapperById('stage-wrapper-parsing'), path: getPathById('line-doc-parsing-mobile') },
                { wrapper: getWrapperById('stage-wrapper-segment-annotation'), path: getPathById('line-parsing-segment-mobile') },
                
                { wrapper: getWrapperById('stage-wrapper-tokenization'), path: getPathById('line-segment-tokenization-mobile') },
                { wrapper: getWrapperById('stage-wrapper-token-indexing'), path: getPathById('line-token-indexing-mobile') },
                { path: getPathById('line-token-search-mobile') }, 
                
                { wrapper: getWrapperById('stage-wrapper-element-annotation'), path: getPathById('line-segment-element-mobile') },
                { wrapper: getWrapperById('stage-wrapper-text-segmentation'), path: getPathById('line-element-text-mobile') },
                { path: getPathById('line-loop-back-mobile') }, 
                { wrapper: getWrapperById('stage-wrapper-generate-embeddings'), path: getPathById('line-text-embeddings-mobile') },
                { wrapper: getWrapperById('stage-wrapper-vector-indexing'), path: getPathById('line-embeddings-vector-mobile') },
                { path: getPathById('line-vector-search-mobile') }, 

                { wrapper: getWrapperById('stage-wrapper-search') }, 
                { wrapper: getWrapperById('stage-wrapper-ranking'), path: getPathById('line-search-ranking-mobile') }
            ];
        }

        for (const step of steps) {
            if (!animationRunning) { 
                // console.log('Animation cycle interrupted externally.');
                return; 
            }

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

        if (!animationRunning) return; 
        await fadeInElement(label, shortDelay);
        await new Promise(r => setTimeout(r, longDelay * 2)); 

        // console.log('Pipeline animation cycle finished. Preparing for next loop.');

        if (animationRunning) { // Loop condition
            resetPipeline();
            animationTimeoutId = setTimeout(() => { 
                animatePipeline(); 
            }, 1000); 
        }
    };

    /**
     * Stops the current animation loop if it's running.
     */
    const stopAnimation = () => {
        animationRunning = false; 
        if (animationTimeoutId) {
            clearTimeout(animationTimeoutId);
            animationTimeoutId = null;
        }
        // console.log('Animation explicitly stopped and cleared pending timeouts.');
    };

    // --- Initialization ---
    /**
     * Resizes the SVG element to match the bounding box of its parent grid,
     * ensuring lines are drawn correctly regardless of zoom or layout changes.
     */
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

    /**
     * Main initialization function, designed to retry if layout is not ready.
     */
    const initializePipeline = (retryCount = 0) => {
        const MAX_INITIALIZATION_RETRIES = 10;
        // console.log(`Attempting to initialize pipeline (retry ${retryCount})...`);

        // Check if all relevant boxes are laid out correctly (have dimensions > 0)
        const elementsToCheckForLayout = [
            document.getElementById('box-document'), 
            document.getElementById('box-document-parsing'), 
            document.getElementById('box-segment-annotation'), 
            document.getElementById('box-tokenization'), 
            document.getElementById('box-element-annotation'),
            document.getElementById('box-text-segmentation'),
            document.getElementById('box-generate-embeddings'),
            document.getElementById('box-token-indexing'),
            document.getElementById('box-vector-indexing'),
            document.getElementById('box-search'),
            document.getElementById('box-ranking')
        ];

        let allBoxesHaveDimensions = true;
        for (const box of elementsToCheckForLayout) {
            if (!box || box.getBoundingClientRect().width === 0 || box.getBoundingClientRect().height === 0) {
                allBoxesHaveDimensions = false;
                break;
            }
        }

        if (!allBoxesHaveDimensions && retryCount < MAX_INITIALIZATION_RETRIES) {
            console.warn(`Initial layout not stable. Retrying initialization in 100ms. (Retry: ${retryCount + 1}/${MAX_INITIALIZATION_RETRIES})`);
            setTimeout(() => initializePipeline(retryCount + 1), 100);
            return; // Exit this call, retry later
        } else if (!allBoxesHaveDimensions && retryCount >= MAX_INITIALIZATION_RETRIES) {
            console.error('Failed to initialize pipeline after multiple retries. Boxes might not be laid out correctly.');
            stopAnimation(); // Stop any potential animation if fundamental layout fails
            resetPipeline();
            // Optionally, display a fallback message to the user
            return;
        }
        console.log('All elements have valid dimensions. Proceeding with drawing and animation.');

        // Initial setup of SVG and drawing lines
        try {
            resizeSVG(); 
            drawAllLines(); // This will also use the internal retry for individual line drawing if needed
        } catch (e) {
            console.error('Error during initial drawing of SVG lines after elements were ready:', e);
            // Even if drawing fails here, try to start animation, but log the error
        }

        // Handle initial screen size visibility
        const initialIsSmallScreen = window.innerWidth <= 992;
        if (initialIsSmallScreen) {
            svg.style.display = 'none'; // Hide SVG on mobile
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'none';
            }
            // For mobile, ensure boxes are visible by default
            document.querySelectorAll('.pipeline-stage-wrapper').forEach(wrapper => {
                wrapper.style.opacity = 1;
                wrapper.style.transform = 'translateY(0)';
                wrapper.classList.add('faded-in');
            });
            // Immediately start mobile animation
            animatePipeline(); 
        } else {
            // On large screens, ensure SVG and zoom controls are visible
            svg.style.display = 'block';
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'flex';
            }
            // Start desktop animation
            animatePipeline();
        }
    };

    // Start the robust initialization process after DOM is loaded
    initializePipeline();

    // Redraw lines on window resize to maintain connections
    let resizeTimer;
    window.addEventListener('resize', () => {
        const isSmallScreen = window.innerWidth <= 992;

        // Toggle SVG display based on screen size
        svg.style.display = isSmallScreen ? 'none' : 'block';
        
        // Hide/show zoom controls based on screen size
        if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
            zoomInBtn.parentElement.style.display = isSmallScreen ? 'none' : 'flex';
        }

        clearTimeout(resizeTimer); 
        stopAnimation(); // Stop current animation cycle
        resetPipeline(); // Reset elements for a clean state

        resizeTimer = setTimeout(() => {
            console.log('Window resized, re-initializing pipeline...');
            // Re-initialize pipeline to adapt to new screen size/layout
            initializePipeline(); 

        }, 250); // Debounce resize for better performance
    });
});
