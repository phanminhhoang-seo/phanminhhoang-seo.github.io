document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired. Starting NLP Pipeline initialization process...');

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
    }

    const adjustZoom = (delta, reset = false) => {
        if (window.innerWidth <= 992) { 
            return;
        }

        if (reset) {
            currentZoom = 1.0;
        } else {
            currentZoom += delta;
            currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom));
        }

        pipelineFlowGrid.style.transform = `scale(${currentZoom})`;

        stopAnimation();
        resetPipeline();

        requestAnimationFrame(() => {
            initializePipeline();
        });
        
        console.log(`Zoom adjusted to: ${currentZoom}`);
    };

    const getElementCenterSVGCoords = (el) => {
        if (!el) {
            console.error('getElementCenterSVGCoords called with null element.');
            return null;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return null;
        }
        const svgRect = svg.getBoundingClientRect();
        return {
            x: (rect.left + rect.width / 2) - svgRect.left,
            y: (rect.top + rect.height / 2) - svgRect.top
        };
    };

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
            const originalDisplay = path.style.display;
            path.style.display = 'block'; 
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.style.display = originalDisplay;
            return path;
        } catch (e) {
            console.error(`Error calculating length for path ${id} with d="${d}":`, e);
            if (path.parentNode === svg) {
                svg.removeChild(path);
            }
            return null;
        }
    };

    const animatePathFlow = (path) => {
        if (!path) return;
        
        path.style.display = 'block';

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
            try {
                const length = path.getTotalLength();
                path.style.strokeDashoffset = length;
            } catch (e) {
                path.style.strokeDashoffset = '0';
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

    const drawAllLines = (retryCount = 0) => {
        const MAX_RETRY = 5;

        svg.innerHTML = '';
        createArrowheadMarker();

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
            'box-document': docBox,
            'box-document-parsing': parsingBox,
            'box-segment-annotation': segmentAnnoBox,
            'box-tokenization': tokenizationBox,
            'box-token-indexing': tokenIndexingBox,
            'box-element-annotation': elementAnnotationBox,
            'box-text-segmentation': textSegmentationBox,
            'box-generate-embeddings': generateEmbeddingsBox,
            'box-vector-indexing': vectorIndexingBox,
            'box-search': searchBox,
            'box-ranking': rankingBox
        };

        let allElementsValid = true;
        const coords = {};
        for (const id in elementsToConnect) {
            const el = elementsToConnect[id];
            if (!el) {
                console.error(`Required element with ID ${id} not found. Cannot calculate coordinates.`);
                allElementsValid = false;
                break;
            }
            const center = getElementCenterSVGCoords(el);
            if (!center) {
                allElementsValid = false;
                break;
            }
            coords[id] = center;
        }

        if (!allElementsValid && retryCount < MAX_RETRY) {
            console.warn(`Layout not stable. Retrying drawAllLines in 100ms. (Retry: ${retryCount + 1}/${MAX_RETRY})`);
            setTimeout(() => drawAllLines(retryCount + 1), 100);
            return;
        } else if (!allElementsValid && retryCount >= MAX_RETRY) {
            console.error('Failed to draw lines after multiple retries. Elements likely not laid out correctly.');
            stopAnimation();
            resetPipeline();
            return;
        }

        const isSmallScreen = window.innerWidth <= 992;

        if (!isSmallScreen) {
            createSvgPath('line-doc-parsing', `M${coords['box-document'].x},${coords['box-document'].y} L${coords['box-document-parsing'].x},${coords['box-document-parsing'].y}`, 'arrowhead-marker');
            createSvgPath('line-parsing-segment', `M${coords['box-document-parsing'].x},${coords['box-document-parsing'].y} L${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y}`, 'arrowhead-marker');

            createSvgPath('line-segment-tokenization',
                `M${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y} ` +
                `L${coords['box-tokenization'].x - 100},${coords['box-segment-annotation'].y} ` +
                `L${coords['box-tokenization'].x - 100},${coords['box-tokenization'].y} ` +
                `L${coords['box-tokenization'].x},${coords['box-tokenization'].y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-segment-element',
                `M${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y} ` +
                `L${coords['box-element-annotation'].x - 100},${coords['box-segment-annotation'].y} ` +
                `L${coords['box-element-annotation'].x - 100},${coords['box-element-annotation'].y} ` +
                `L${coords['box-element-annotation'].x},${coords['box-element-annotation'].y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-token-indexing', `M${coords['box-tokenization'].x},${coords['box-tokenization'].y} L${coords['box-token-indexing'].x},${coords['box-token-indexing'].y}`, 'arrowhead-marker');
            createSvgPath('line-element-text', `M${coords['box-element-annotation'].x},${coords['box-element-annotation'].y} L${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y}`, 'arrowhead-marker');
            createSvgPath('line-text-embeddings', `M${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y} L${coords['box-generate-embeddings'].x},${coords['box-generate-embeddings'].y}`, 'arrowhead-marker');
            createSvgPath('line-embeddings-vector', `M${coords['box-generate-embeddings'].x},${coords['box-generate-embeddings'].y} L${coords['box-vector-indexing'].x},${coords['box-vector-indexing'].y}`, 'arrowhead-marker');

            const controlPointOffset = 100;
            createSvgPath('line-loop-back',
                `M${coords['box-text-segmentation'].x},${coords['box-text-segmentation'].y} ` +
                `C${coords['box-text-segmentation'].x + controlPointOffset},${coords['box-text-segmentation'].y + controlPointOffset} ` +
                `${coords['box-segment-annotation'].x + controlPointOffset},${coords['box-segment-annotation'].y + controlPointOffset} ` +
                `${coords['box-segment-annotation'].x},${coords['box-segment-annotation'].y}`,
                'arrowhead-marker'
            );

            createSvgPath('line-token-search', `M${coords['box-token-indexing'].x},${coords['box-token-indexing'].y} L${coords['box-search'].x},${coords['box-search'].y}`, 'arrowhead-marker');
            createSvgPath('line-vector-search', `M${coords['box-vector-indexing'].x},${coords['box-vector-indexing'].y} L${coords['box-search'].x},${coords['box-search'].y}`, 'arrowhead-marker');

            createSvgPath('line-search-ranking', `M${coords['box-search'].x},${coords['box-search'].y} L${coords['box-ranking'].x},${coords['box-ranking'].y}`, 'arrowhead-marker');

        } else {
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
    };

    let animationRunning = false; 
    let animationTimeoutId = null; 

    const animatePipeline = async () => {
        if (animationRunning) {
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
        if (!isSmallScreen) {
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
        } else {
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

        if (animationRunning) {
            resetPipeline();
            animationTimeoutId = setTimeout(() => { 
                animatePipeline(); 
            }, 1000); 
        }
    };

    const stopAnimation = () => {
        animationRunning = false; 
        if (animationTimeoutId) {
            clearTimeout(animationTimeoutId);
            animationTimeoutId = null;
        }
    };

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

    const initializePipeline = (retryCount = 0) => {
        const MAX_INITIALIZATION_RETRIES = 10;

        const currentIsSmallScreen = window.innerWidth <= 992;
        if (currentIsSmallScreen) {
            svg.style.display = 'none';
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'none';
            }
        } else {
            svg.style.display = 'block';
            if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
                zoomInBtn.parentElement.style.display = 'flex';
            }
        }

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
            if (!box) {
                console.error(`Element not found during layout check: ${box}. This should not happen after DOMContentLoaded.`);
                allBoxesHaveDimensions = false;
                break;
            }
            const rect = box.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || isNaN(rect.width) || isNaN(rect.height)) {
                allBoxesHaveDimensions = false;
                break;
            }
        }

        if (!allBoxesHaveDimensions && retryCount < MAX_INITIALIZATION_RETRIES) {
            console.warn(`Layout not stable. Retrying initialization in 100ms. (Retry: ${retryCount + 1}/${MAX_INITIALIZATION_RETRIES})`);
            setTimeout(() => initializePipeline(retryCount + 1), 100);
            return;
        } else if (!allBoxesHaveDimensions && retryCount >= MAX_INITIALIZATION_RETRIES) {
            console.error('Failed to initialize pipeline after multiple retries. Boxes might not be laid out correctly.');
            stopAnimation();
            resetPipeline();
            return;
        }
        console.log('All elements have valid dimensions. Proceeding with drawing and animation.');

        try {
            resizeSVG(); 
            drawAllLines();
        } catch (e) {
            console.error('Error during SVG drawing:', e);
        }

        animatePipeline();
    };

    setTimeout(() => {
        initializePipeline();
    }, 500);

    let resizeTimer;
    window.addEventListener('resize', () => {
        const isSmallScreen = window.innerWidth <= 992;

        svg.style.display = isSmallScreen ? 'none' : 'block';
        
        if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
            zoomInBtn.parentElement.style.display = isSmallScreen ? 'none' : 'flex';
        }

        clearTimeout(resizeTimer); 
        stopAnimation();
        resetPipeline();

        resizeTimer = setTimeout(() => {
            console.log('Window resized, re-initializing pipeline...');
            initializePipeline();
        }, 250); 
    });
});
