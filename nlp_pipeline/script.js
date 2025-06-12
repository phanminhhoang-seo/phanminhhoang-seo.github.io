document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing NLP Pipeline.');

    const container = document.querySelector('.pipeline-container');
    const svg = document.querySelector('.pipeline-lines');
    const pipelineFlowGrid = document.querySelector('.pipeline-flow-grid');

    if (!container || !svg || !pipelineFlowGrid) {
        console.error('Error: Essential DOM elements (container, svg, or grid) not found. Aborting script.');
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
            return;
        }

        if (reset) {
            currentZoom = 1.0;
        } else {
            currentZoom += delta;
            currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom)); // Clamp zoom
        }

        pipelineFlowGrid.style.transform = `scale(${currentZoom})`;

        animationRunning = false; 
        resetPipeline(); 
        resizeSVG(); 
        drawAllLines(); 

        setTimeout(() => {
            animatePipeline();
        }, 500); // Give time for redraw and initial element positioning
        
        console.log(`Zoom adjusted to: ${currentZoom}`);
    };

    /**
     * Calculates the center coordinates of an HTML element relative to the SVG canvas.
     * @param {HTMLElement} el The element to get the center of.
     * @returns {{x: number, y: number}} An object with x and y coordinates relative to the SVG.
     */
    const getElementCenterSVGCoords = (el) => {
        if (!el) {
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
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', id);
        path.setAttribute('d', d);
        path.classList.add('pipeline-line');
        if (markerEndId) {
            path.setAttribute('marker-end', `url(#${markerEndId})`);
        }
        svg.appendChild(path);

        try {
            path.style.display = 'block'; 
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
        } catch (e) {
            console.error(`Error calculating length for path ${id}:`, e);
            path.style.strokeDasharray = '0'; 
            path.style.strokeDashoffset = '0'; 
        }
        return path;
    };

    /**
     * Animates the drawing of an SVG path and applies the flow animation class.
     * @param {SVGPathElement} path The path element to animate.
     */
    const animatePathFlow = (path) => {
        if (!path) return;
        
        path.style.transition = 'none'; 
        void path.offsetWidth; 
        path.style.strokeDashoffset = path.getTotalLength(); 
        path.style.opacity = window.innerWidth > 992 ? 0.8 : 0.7;

        path.style.transition = 'stroke-dashoffset 1s ease-out, opacity 0.5s ease-out';
        path.style.strokeDashoffset = '0';
        path.style.opacity = 1;
        path.classList.add('animate');

        const markerId = path.getAttribute('marker-end');
        if (markerId) {
            const markerElement = svg.querySelector(markerId.substring(4, markerId.length - 1));
            if (markerElement) {
                const arrowheadPath = markerElement.querySelector('.arrowhead');
                if (arrowheadPath) {
                    arrowheadPath.style.transition = 'fill 0.5s ease-in-out';
                    arrowheadPath.style.fill = window.innerWidth > 992 ? 'var(--color-animated-line)' : 'var(--color-text-dark)'; 
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
                    arrowheadPath.style.transition = 'fill 0.5s ease-in-out';
                    arrowheadPath.style.fill = 'var(--color-text-dark)';
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
                    elWrapper.style.transition = 'none'; 
                    void elWrapper.offsetWidth; 
                    elWrapper.style.opacity = 0; 
                    elWrapper.style.transform = 'translateY(20px)';

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
            const length = path.getTotalLength();
            path.style.strokeDashoffset = length;
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
        path.classList.add('arrowhead'); 
        marker.appendChild(path);
        defs.appendChild(marker);
    };

    /**
     * Draws all the SVG lines connecting the pipeline boxes.
     * Logic changes based on screen size (desktop vs mobile).
     */
    const drawAllLines = () => {
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

        // Verify all required elements are present. If any are null, stop.
        const elements = {
            docBox, parsingBox, segmentAnnoBox, tokenizationBox, tokenIndexingBox,
            elementAnnotationBox, textSegmentationBox, generateEmbeddingsBox,
            vectorIndexingBox, searchBox, rankingBox
        };

        for (const [name, el] of Object.entries(elements)) {
            if (!el) {
                console.error(`Missing element: ${name}. Cannot draw lines. Check its ID in HTML.`);
                return; // Stop drawing if a critical element is missing
            }
        }

        const C = getElementCenterSVGCoords; // Alias for brevity

        const isSmallScreen = window.innerWidth <= 992;

        if (!isSmallScreen) { // Desktop/Large Screen Logic (Grid Layout)
            createSvgPath('line-doc-parsing', `M${C(docBox).x},${C(docBox).y} L${C(parsingBox).x},${C(parsingBox).y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment', `M${C(parsingBox).x},${C(parsingBox).y} L${C(segmentAnnoBox).x},${C(segmentAnnoBox).y}`, 'arrowhead-marker');

            // Branching to Tokenization
            createSvgPath('line-segment-tokenization',
                `M${C(segmentAnnoBox).x},${C(segmentAnnoBox).y} ` +
                `L${C(tokenizationBox).x - 100},${C(segmentAnnoBox).y} ` + // Horizontal to the left of tokenization
                `L${C(tokenizationBox).x - 100},${C(tokenizationBox).y} ` + // Vertical up to tokenization level
                `L${C(tokenizationBox).x},${C(tokenizationBox).y}`, // Horizontal to tokenization
                'arrowhead-marker'
            );

            // Branching to Element Annotation
            createSvgPath('line-segment-element',
                `M${C(segmentAnnoBox).x},${C(segmentAnnoBox).y} ` +
                `L${C(elementAnnotationBox).x - 100},${C(segmentAnnoBox).y} ` + // Horizontal to the left of element annotation
                `L${C(elementAnnotationBox).x - 100},${C(elementAnnotationBox).y} ` + // Vertical down to element annotation level
                `L${C(elementAnnotationBox).x},${C(elementAnnotationBox).y}`, // Horizontal to element annotation
                'arrowhead-marker'
            );

            createSvgPath('line-token-indexing', `M${C(tokenizationBox).x},${C(tokenizationBox).y} L${C(tokenIndexingBox).x},${C(tokenIndexingBox).y}`, 'arrowhead-marker');
            createSvgPath('line-element-text', `M${C(elementAnnotationBox).x},${C(elementAnnotationBox).y} L${C(textSegmentationBox).x},${C(textSegmentationBox).y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings', `M${C(textSegmentationBox).x},${C(textSegmentationBox).y} L${C(generateEmbeddingsBox).x},${C(generateEmbeddingsBox).y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector', `M${C(generateEmbeddingsBox).x},${C(generateEmbeddingsBox).y} L${C(vectorIndexingBox).x},${C(vectorIndexingBox).y}`, 'arrowhead-marker');

            // Loop Back (Complex Curve)
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

            // Converging lines to Search
            createSvgPath('line-token-search', `M${C(tokenIndexingBox).x},${C(tokenIndexingBox).y} L${C(searchBox).x},${C(searchBox).y}`, 'arrowhead-marker');
            createSvgPath('line-vector-search', `M${C(vectorIndexingBox).x},${C(vectorIndexingBox).y} L${C(searchBox).x},${C(searchBox).y}`, 'arrowhead-marker');

            createSvgPath('line-search-ranking', `M${C(searchBox).x},${C(searchBox).y} L${C(rankingBox).x},${C(rankingBox).y}`, 'arrowhead-marker');

        } else { // Mobile/Small Screen Logic (Vertical Stack Layout) - Simplified Paths
            // All paths are drawn as simple vertical lines between centers of stacked elements
            createSvgPath('line-doc-parsing-mobile', `M${C(docBox).x},${C(docBox).y} L${C(parsingBox).x},${C(parsingBox).y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment-mobile', `M${C(parsingBox).x},${C(parsingBox).y} L${C(segmentAnnoBox).x},${C(segmentAnnoBox).y}`, 'arrowhead-marker');
            
            // Branching on mobile - direct vertical
            createSvgPath('line-segment-tokenization-mobile', `M${C(segmentAnnoBox).x},${C(segmentAnnoBox).y} L${C(tokenizationBox).x},${C(tokenizationBox).y}`, 'arrowhead-marker');
            createSvgPath('line-token-indexing-mobile', `M${C(tokenizationBox).x},${C(tokenizationBox).y} L${C(tokenIndexingBox).x},${C(tokenIndexingBox).y}`, 'arrowhead-marker');
            
            // Converging to search (mobile) - simplified to direct vertical connection
            createSvgPath('line-token-search-mobile', `M${C(tokenIndexingBox).x},${C(tokenIndexingBox).y} L${C(searchBox).x},${C(searchBox).y}`, 'arrowhead-marker');
            
            createSvgPath('line-segment-element-mobile', `M${C(segmentAnnoBox).x},${C(segmentAnnoBox).y} L${C(elementAnnotationBox).x},${C(elementAnnotationBox).y}`, 'arrowhead-marker');
            createSvgPath('line-element-text-mobile', `M${C(elementAnnotationBox).x},${C(elementAnnotationBox).y} L${C(textSegmentationBox).x},${C(textSegmentationBox).y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings-mobile', `M${C(textSegmentationBox).x},${C(textSegmentationBox).y} L${C(generateEmbeddingsBox).x},${C(generateEmbeddingsBox).y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector-mobile', `M${C(generateEmbeddingsBox).x},${C(generateEmbeddingsBox).y} L${C(vectorIndexingBox).x},${C(vectorIndexingBox).y}`, 'arrowhead-marker');

            // Loop back on mobile (simplified L-shape)
            createSvgPath('line-loop-back-mobile', 
                `M${C(textSegmentationBox).x},${C(textSegmentationBox).y} ` +
                `L${C(textSegmentationBox).x},${C(segmentAnnoBox).y + 100} ` + // Go down from Text Segmentation
                `L${C(segmentAnnoBox).x},${C(segmentAnnoBox).y + 100} ` + // Go left to align with Segment Annotation's X
                `L${C(segmentAnnoBox).x},${C(segmentAnnoBox).y}`, // Go up to Segment Annotation
                'arrowhead-marker'
            );

            createSvgPath('line-vector-search-mobile', `M${C(vectorIndexingBox).x},${C(vectorIndexingBox).y} L${C(searchBox).x},${C(searchBox).y}`, 'arrowhead-marker');
            createSvgPath('line-search-ranking-mobile', `M${C(searchBox).x},${C(searchBox).y} L${C(rankingBox).x},${C(rankingBox).y}`, 'arrowhead-marker');
        }
    };

    // --- Animation Sequence ---
    let animationRunning = false; 
    let animationTimeoutId = null; // To store setTimeout ID for animation loop

    const animatePipeline = async () => {
        // Prevent multiple animation loops from starting
        if (animationRunning) { 
            console.log('Animation already running, skipping start.');
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
            // Check if animation was stopped externally during the loop
            if (!animationRunning) {
                console.log('Animation stopped externally during cycle.');
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

        console.log('Pipeline animation cycle finished. Preparing for next loop.');

        if (animationRunning) { // Loop condition
            resetPipeline();
            // Store the timeout ID so it can be cleared
            animationTimeoutId = setTimeout(() => { 
                animatePipeline(); 
            }, 1000); // Pause after reset before new cycle
        }
    };

    /**
     * Stops the current animation loop if it's running.
     */
    const stopAnimation = () => {
        animationRunning = false; // Signal to stop the loop in the next iteration
        if (animationTimeoutId) {
            clearTimeout(animationTimeoutId); // Clear any pending loop calls
            animationTimeoutId = null;
        }
        console.log('Animation explicitly stopped.');
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

        // Set SVG width/height to match grid wrapper's dimensions
        svg.style.width = `${gridRect.width}px`;
        svg.style.height = `${gridRect.height}px`;
        // Position SVG relative to the top-left of the container,
        // accounting for grid's offset within the container.
        svg.style.left = `${gridRect.left - containerRect.left}px`;
        svg.style.top = `${gridRect.top - containerRect.top}px`;
    };

    // Initial setup: Draw all SVG lines before starting animation
    // Use a small delay for initial setup to allow CSS to fully render
    // This helps prevent "mũi tên rải rác" on initial load/F5
    setTimeout(() => {
        try {
            resizeSVG(); 
            drawAllLines(); 
        } catch (e) {
            console.error('Error during initial drawing of SVG lines:', e);
        }

        // Start the animation sequence, which will then loop
        animatePipeline();

        // Handle initial screen size state (if page loads on small screen)
        const initialIsSmallScreen = window.innerWidth <= 992;
        if (initialIsSmallScreen) {
            // Hide SVG and zoom controls initially
            svg.style.display = 'none';
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'none';
            }
            // Force redraw for mobile view and start mobile animation after a short delay
            // This re-ensures correctness if the initial drawAllLines was based on desktop layout
            setTimeout(() => {
                stopAnimation(); // Stop any desktop animation that might have started
                resetPipeline(); 
                resizeSVG();
                drawAllLines(); // Draw mobile paths
                animatePipeline(); // Start mobile animation
            }, 500); // Give a bit more time for initial layout to settle
        }
    }, 100); // Initial delay to ensure DOM is fully ready and styled


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

        clearTimeout(resizeTimer); // Clear any previous resize timeout
        stopAnimation(); // Stop current animation cycle
        resetPipeline(); // Reset all elements to initial state

        resizeTimer = setTimeout(() => {
            console.log('Window resized, redrawing lines and restarting animation...');
            resizeSVG();
            drawAllLines(); // Redraw lines based on new screen size (desktop or mobile paths)

            setTimeout(() => {
                animatePipeline(); // Restart animation
            }, 500); // Give time for redraw and initial element positioning
        }, 250); // Debounce resize for better performance
    });
});
