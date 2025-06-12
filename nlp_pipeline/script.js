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
        zoomResetBtn.addEventListener('click', () => adjustZoom(1.0, true));
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
            drawAllLines();
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
        // Crucial check: if width/height is 0, element is not laid out correctly (e.g., display: none)
        if (rect.width === 0 || rect.height === 0) {
            console.warn(`Element ${el.id || el.className} has zero dimensions. Layout might not be ready.`);
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
            const originalDisplay = path.style.display;
            path.style.display = 'block'; 
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.style.display = originalDisplay; // Restore original display
            return path;
        } catch (e) {
            console.error(`Error calculating length for path ${id} with d="${d}":`, e);
            svg.removeChild(path); // Remove invalid path
            return null;
        }
    };

    /**
     * Animates the drawing of an SVG path and applies the flow animation class.
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

        const elementsToConnect = {
            docBox, parsingBox, segmentAnnoBox, tokenizationBox, tokenIndexingBox,
            elementAnnotationBox, textSegmentationBox, generateEmbeddingsBox,
            vectorIndexingBox, searchBox, rankingBox
        };

        const C = getElementCenterSVGCoords; // Alias for brevity
        const isSmallScreen = window.innerWidth <= 992;
        
        let allElementsValid = true;
        const coords = {};
        for (const name in elementsToConnect) {
            const el = elementsToConnect[name];
            const center = C(el);
            if (!center) { // If element has zero dimensions
                allElementsValid = false;
                break;
            }
            coords[name] = center;
        }

        if (!allElementsValid && retryCount < MAX_RETRY) {
            console.warn(`Element dimensions invalid. Retrying drawAllLines in 100ms. (Retry: ${retryCount + 1}/${MAX_RETRY})`);
            setTimeout(() => drawAllLines(retryCount + 1), 100);
            return;
        } else if (!allElementsValid && retryCount >= MAX_RETRY) {
            console.error('Failed to draw lines after multiple retries. Elements likely not laid out correctly.');
            return;
        }

        // --- Actual Drawing Logic ---
        if (!isSmallScreen) { // Desktop/Large Screen Logic (Grid Layout)
            createSvgPath('line-doc-parsing', `M${coords.docBox.x},${coords.docBox.y} L${coords.parsingBox.x},${coords.parsingBox.y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment', `M${coords.parsingBox.x},${coords.parsingBox.y} L${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y}`, 'arrowhead-marker');

            createSvgPath('line-segment-tokenization',
                `M${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y} ` +
                `L${coords.tokenizationBox.x - 100},${coords.segmentAnnoBox.y} ` +
                `L${coords.tokenizationBox.x - 100},${coords.tokenizationBox.y} ` +
                `L${coords.tokenizationBox.x},${coords.tokenizationBox.y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-segment-element',
                `M${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y} ` +
                `L${coords.elementAnnotationBox.x - 100},${coords.segmentAnnoBox.y} ` +
                `L${coords.elementAnnotationBox.x - 100},${coords.elementAnnotationBox.y} ` +
                `L${coords.elementAnnotationBox.x},${coords.elementAnnotationBox.y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-token-indexing', `M${coords.tokenizationBox.x},${coords.tokenizationBox.y} L${coords.tokenIndexingBox.x},${coords.tokenIndexingBox.y}`, 'arrowhead-marker');
            createSvgPath('line-element-text', `M${coords.elementAnnotationBox.x},${coords.elementAnnotationBox.y} L${coords.textSegmentationBox.x},${coords.textSegmentationBox.y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings', `M${coords.textSegmentationBox.x},${coords.textSegmentationBox.y} L${coords.generateEmbeddingsBox.x},${coords.generateEmbeddingsBox.y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector', `M${coords.generateEmbeddingsBox.x},${coords.generateEmbeddingsBox.y} L${coords.vectorIndexingBox.x},${coords.vectorIndexingBox.y}`, 'arrowhead-marker');

            const controlPointOffset = 100;
            createSvgPath('line-loop-back',
                `M${coords.textSegmentationBox.x},${coords.textSegmentationBox.y} ` +
                `C${coords.textSegmentationBox.x + controlPointOffset},${coords.textSegmentationBox.y + controlPointOffset} ` +
                `${coords.segmentAnnoBox.x + controlPointOffset},${coords.segmentAnnoBox.y + controlPointOffset} ` +
                `${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-token-search', `M${coords.tokenIndexingBox.x},${coords.tokenIndexingBox.y} L${coords.searchBox.x},${coords.searchBox.y}`, 'arrowhead-marker');
            createSvgPath('line-vector-search', `M${coords.vectorIndexingBox.x},${coords.vectorIndexingBox.y} L${coords.searchBox.x},${coords.searchBox.y}`, 'arrowhead-marker');

            createSvgPath('line-search-ranking', `M${coords.searchBox.x},${coords.searchBox.y} L${coords.rankingBox.x},${coords.rankingBox.y}`, 'arrowhead-marker');

        } else { // Mobile/Small Screen Logic (Vertical Stack Layout) - Simplified Paths
            createSvgPath('line-doc-parsing-mobile', `M${coords.docBox.x},${coords.docBox.y} L${coords.parsingBox.x},${coords.parsingBox.y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment-mobile', `M${coords.parsingBox.x},${coords.parsingBox.y} L${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y}`, 'arrowhead-marker');
            
            createSvgPath('line-segment-tokenization-mobile', `M${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y} L${coords.tokenizationBox.x},${coords.tokenizationBox.y}`, 'arrowhead-marker');
            createSvgPath('line-token-indexing-mobile', `M${coords.tokenizationBox.x},${coords.tokenizationBox.y} L${coords.tokenIndexingBox.x},${coords.tokenIndexingBox.y}`, 'arrowhead-marker');
            
            createSvgPath('line-token-search-mobile', `M${coords.tokenIndexingBox.x},${coords.tokenIndexingBox.y} L${coords.searchBox.x},${coords.searchBox.y}`, 'arrowhead-marker');
            
            createSvgPath('line-segment-element-mobile', `M${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y} L${coords.elementAnnotationBox.x},${coords.elementAnnotationBox.y}`, 'arrowhead-marker');
            createSvgPath('line-element-text-mobile', `M${coords.elementAnnotationBox.x},${coords.elementAnnotationBox.y} L${coords.textSegmentationBox.x},${coords.textSegmentationBox.y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings-mobile', `M${coords.textSegmentationBox.x},${coords.textSegmentationBox.y} L${coords.generateEmbeddingsBox.x},${coords.generateEmbeddingsBox.y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector-mobile', `M${coords.generateEmbeddingsBox.x},${coords.generateEmbeddingsBox.y} L${coords.vectorIndexingBox.x},${coords.vectorIndexingBox.y}`, 'arrowhead-marker');

            createSvgPath('line-loop-back-mobile', 
                `M${coords.textSegmentationBox.x},${coords.textSegmentationBox.y} ` +
                `L${coords.textSegmentationBox.x},${coords.segmentAnnoBox.y + 100} ` +
                `L${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y + 100} ` +
                `L${coords.segmentAnnoBox.x},${coords.segmentAnnoBox.y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-vector-search-mobile', `M${coords.vectorIndexingBox.x},${coords.vectorIndexingBox.y} L${coords.searchBox.x},${coords.searchBox.y}`, 'arrowhead-marker');
            createSvgPath('line-search-ranking-mobile', `M${coords.searchBox.x},${coords.searchBox.y} L${coords.rankingBox.x},${coords.rankingBox).y}`, 'arrowhead-marker');
        }
        console.log('Finished drawAllLines attempt.');
    };

    // --- Animation Sequence ---
    let animationRunning = false; 
    let animationTimeoutId = null; 

    const animatePipeline = async () => {
        if (animationRunning) {
            return; // Animation already running
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
            if (!animationRunning) { // Check if animation was stopped externally
                console.log('Animation cycle interrupted externally.');
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
        console.log('Animation explicitly stopped and cleared pending timeouts.');
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
        console.log(`Attempting to initialize pipeline (retry ${retryCount})...`);

        // Handle initial screen size state (if page loads on small screen)
        const initialIsSmallScreen = window.innerWidth <= 992;
        if (initialIsSmallScreen) {
            svg.style.display = 'none'; // Hide SVG and zoom controls initially
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'none';
            }
        } else {
            // Ensure SVG and zoom controls are visible on large screens
            svg.style.display = 'block';
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'flex';
            }
        }

        try {
            resizeSVG(); 
            // Call drawAllLines with retry logic, it will handle if elements aren't ready
            drawAllLines(); 

            // Check if drawing was successful (i.e., no critical elements were missing)
            const allPaths = svg.querySelectorAll('.pipeline-line');
            if (allPaths.length === 0 && !initialIsSmallScreen) { // If no paths drawn on desktop, something is wrong
                throw new Error('No SVG paths were drawn. Elements might not be ready or are hidden.');
            }

            // Start animation only after drawing is successful
            animatePipeline();

        } catch (e) {
            console.error('Error during pipeline initialization:', e);
            if (retryCount < MAX_INITIALIZATION_RETRIES) {
                setTimeout(() => initializePipeline(retryCount + 1), 200 * Math.pow(2, retryCount)); // Exponential back-off retry
            } else {
                console.error('Failed to initialize pipeline after multiple retries.');
                // Display a message to the user if needed
            }
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
            console.log('Window resized, redrawing lines and restarting animation...');
            
            resizeSVG();
            drawAllLines(); // Redraw lines based on new screen size (desktop or mobile paths)

            animatePipeline(); // Restart animation
        }, 250); 
    });
});
