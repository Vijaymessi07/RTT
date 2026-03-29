/**
 * RUKKU TRAVELS - PERFORMANCE MONITORING
 * 
 * Drop this script into your page to track performance metrics.
 * Open browser console to see measurements.
 * 
 * Usage: Add <script src="js/performance-monitor.js" defer></script> before closing </body>
 */

(function() {
    'use strict';

    // Performance Metrics Object
    const performanceMetrics = {
        pageLoadTime: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
        resources: []
    };

    // Initialize performance monitoring
    window.addEventListener('load', () => {
        setTimeout(collectMetrics, 0);
    });

    function collectMetrics() {
        // Get Navigation Timing API data
        const navTiming = window.performance.getEntriesByType('navigation')[0];
        
        if (navTiming) {
            performanceMetrics.pageLoadTime = navTiming.loadEventEnd - navTiming.fetchStart;
            
            // Additional timing metrics
            const ttfb = navTiming.responseStart - navTiming.fetchStart;
            const processingTime = navTiming.loadEventStart - navTiming.responseEnd;
            
            console.log('📊 PERFORMANCE METRICS');
            console.log('='.repeat(60));
            console.log(`🕐 Total Page Load Time: ${Math.round(performanceMetrics.pageLoadTime)}ms`);
            console.log(`📥 Time to First Byte (TTFB): ${Math.round(ttfb)}ms`);
            console.log(`⚙️  DOM Processing Time: ${Math.round(processingTime)}ms`);
        }

        // Paint Timing API
        const paintEntries = window.performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
                performanceMetrics.firstPaint = Math.round(entry.startTime);
                console.log(`🎨 First Paint: ${performanceMetrics.firstPaint}ms`);
            }
            if (entry.name === 'first-contentful-paint') {
                performanceMetrics.firstContentfulPaint = Math.round(entry.startTime);
                console.log(`📝 First Contentful Paint (FCP): ${performanceMetrics.firstContentfulPaint}ms`);
            }
        });

        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    performanceMetrics.largestContentfulPaint = Math.round(lastEntry.renderTime || lastEntry.loadTime);
                    console.log(`📻 Largest Contentful Paint (LCP): ${performanceMetrics.largestContentfulPaint}ms`);
                });
                lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
            } catch (e) {
                console.warn('LCP observation not supported');
            }
        }

        // Resource Timing
        collectResourceMetrics();

        // Core Web Vitals Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ OPTIMIZATION CHECKPOINTS:');
        console.log('='.repeat(60));
        
        // FCP Target: < 1.8s
        if (performanceMetrics.firstContentfulPaint < 1800) {
            console.log(`✅ FCP < 1.8s (GOOD): ${performanceMetrics.firstContentfulPaint}ms`);
        } else {
            console.log(`⚠️  FCP > 1.8s (SLOW): ${performanceMetrics.firstContentfulPaint}ms`);
            console.log('   → Compress images more, defer non-critical CSS');
        }

        // Page Load Target: < 3s
        if (performanceMetrics.pageLoadTime < 3000) {
            console.log(`✅ Page Load < 3s (GOOD): ${Math.round(performanceMetrics.pageLoadTime)}ms`);
        } else {
            console.log(`⚠️  Page Load > 3s (SLOW): ${Math.round(performanceMetrics.pageLoadTime)}ms`);
            console.log('   → Optimize images, enable gzip compression');
        }

        // Memory usage (if available)
        if (performance.memory) {
            const usedMemory = Math.round(performance.memory.usedJSHeapSize / 1048576); // Convert to MB
            const totalMemory = Math.round(performance.memory.totalJSHeapSize / 1048576);
            console.log(`💾 JavaScript Memory: ${usedMemory}MB / ${totalMemory}MB`);
            
            if (usedMemory > 50) {
                console.log('⚠️  High memory usage detected. Check for memory leaks.');
            }
        }

        console.log('\n' + '='.repeat(60));
    }

    function collectResourceMetrics() {
        const resources = window.performance.getEntriesByType('resource');
        
        let totalSize = 0;
        let slowResources = [];
        let categoryStats = {
            images: { count: 0, size: 0, time: 0 },
            scripts: { count: 0, size: 0, time: 0 },
            stylesheets: { count: 0, size: 0, time: 0 },
            fonts: { count: 0, size: 0, time: 0 },
            documents: { count: 0, size: 0, time: 0 },
            other: { count: 0, size: 0, time: 0 }
        };

        resources.forEach(resource => {
            const size = resource.transferSize || 0;
            const duration = resource.duration;
            totalSize += size;

            // Categorize resources
            let category = 'other';
            if (resource.name.includes('.jpg') || resource.name.includes('.jpeg') || 
                resource.name.includes('.png') || resource.name.includes('.gif') ||
                resource.name.includes('.webp')) {
                category = 'images';
            } else if (resource.name.includes('.js')) {
                category = 'scripts';
            } else if (resource.name.includes('.css')) {
                category = 'stylesheets';
            } else if (resource.name.includes('.woff') || resource.name.includes('.ttf')) {
                category = 'fonts';
            } else if (resource.name.includes('.html')) {
                category = 'documents';
            }

            categoryStats[category].count++;
            categoryStats[category].size += size;
            categoryStats[category].time += duration;

            // Find slow resources (> 500ms)
            if (duration > 500) {
                slowResources.push({
                    name: resource.name.split('/').pop(),
                    duration: Math.round(duration),
                    size: Math.round(size / 1024) // KB
                });
            }
        });

        console.log(`\n📦 RESOURCE BREAKDOWN:`);
        console.log(`Total Resources Loaded: ${resources.length}`);
        console.log(`Total Transfer Size: ${Math.round(totalSize / 1024)}KB`);

        console.log('\nBy Category:');
        Object.entries(categoryStats).forEach(([category, stats]) => {
            if (stats.count > 0) {
                console.log(`  • ${category}: ${stats.count} files, ${Math.round(stats.size / 1024)}KB, ${Math.round(stats.time)}ms`);
            }
        });

        // Slow resources
        if (slowResources.length > 0) {
            console.log(`\n⚠️  SLOW RESOURCES (>500ms):`);
            slowResources.slice(0, 5).forEach(resource => {
                console.log(`  • ${resource.name}: ${resource.duration}ms (${resource.size}KB)`);
            });
        }
    }

    // Export metrics globally for debugging
    window.rukuPerformanceMetrics = performanceMetrics;

    // Add performance summary to page (optional)
    function addPerformanceBadge() {
        if (typeof performanceMetrics.pageLoadTime === 'number' && performanceMetrics.pageLoadTime > 0) {
            const badge = document.createElement('div');
            badge.id = 'ruku-perf-badge';
            badge.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(238, 160, 22, 0.9);
                color: #0D0216;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                font-family: monospace;
                display: none;
            `;
            badge.innerHTML = `
                ⚡ Load: ${Math.round(performanceMetrics.pageLoadTime)}ms<br>
                FCP: ${performanceMetrics.firstContentfulPaint}ms
            `;
            badge.title = 'Click to toggle detailed metrics';
            badge.onclick = () => {
                alert(`
Performance Metrics:
- Total Load Time: ${Math.round(performanceMetrics.pageLoadTime)}ms
- First Paint: ${performanceMetrics.firstPaint}ms
- First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms
- LCP: ${performanceMetrics.largestContentfulPaint}ms

View full metrics in browser console.
                `);
            };
            
            // Only show badge in development (check URL)
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.pathname.includes('dev')) {
                setTimeout(() => {
                    badge.style.display = 'block';
                    document.body.appendChild(badge);
                }, 1000);
            }
        }
    }

    // Add badge after metrics are collected
    window.addEventListener('load', () => {
        setTimeout(addPerformanceBadge, 2000);
    });

    console.log('✅ Performance Monitor Initialized');
    console.log('💡 Tip: Type window.rukuPerformanceMetrics in console to see all metrics');

})();
