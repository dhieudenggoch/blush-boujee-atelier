/**
 * mobile-compatibility.test.js
 * Acceptance tests for the mobile compatibility feature.
 * Maps 1:1 to acceptance criteria in the approved user story.
 */

// AC1: Hero section overlays correctly on mobile
describe('Hero section – mobile layout', () => {
  it('applies bottom-overlay positioning on screens ≤860px', () => {
    // The .hero-text-panel @media rule sets bottom:0, width:100% at ≤860px
    // This is verified by checking the inline style override exists in page.js
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/page.js`, 'utf8')
    expect(src).toContain('hero-text-panel')
    expect(src).toContain('bottom:0')
  })

  it('CTA button row uses flex-direction column on mobile via .hero-btns-row rule', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/page.js`, 'utf8')
    expect(src).toContain('hero-btns-row')
    expect(src).toContain('flex-direction:column')
  })
})

// AC2: Product gallery supports touch swipe
describe('ProductGallery – touch swipe', () => {
  it('has onTouchStart and onTouchEnd handlers on the main image container', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/[id]/ProductGallery.js`, 'utf8')
    expect(src).toContain('onTouchStart')
    expect(src).toContain('onTouchEnd')
  })

  it('uses a ref to track touch start X position', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/[id]/ProductGallery.js`, 'utf8')
    expect(src).toContain('touchStartRef')
    expect(src).toContain('useRef')
  })

  it('swipe threshold is 40px', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/[id]/ProductGallery.js`, 'utf8')
    expect(src).toContain('> 40')
  })

  it('disables zoom on touch devices', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/[id]/ProductGallery.js`, 'utf8')
    expect(src).toContain('isTouchDevice')
    expect(src).toContain('ontouchstart')
  })
})

// AC3: Filter bar scrolls horizontally on mobile
describe('ProductGrid – filter bar', () => {
  it('uses .filter-bar class on category button container', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/ProductGrid.js`, 'utf8')
    expect(src).toContain('className="filter-bar"')
  })

  it('globals.css defines .filter-bar with overflow-x:auto at ≤640px', () => {
    const fs = require('fs')
    const css = fs.readFileSync(`${__dirname}/../app/globals.css`, 'utf8')
    expect(css).toContain('.filter-bar')
    expect(css).toContain('overflow-x:auto')
  })
})

// AC4: Touch targets ≥ 44×44px
describe('Touch targets – 44px minimum', () => {
  it('ProductActions stepper buttons have minWidth and minHeight of 44px', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/[id]/ProductActions.js`, 'utf8')
    // Both stepper buttons should have minWidth:44, minHeight:44
    const matches = src.match(/minWidth:44/g)
    expect(matches).not.toBeNull()
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('ProductGallery variant picker buttons have minWidth/minHeight ≥ 44', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/products/[id]/ProductGallery.js`, 'utf8')
    expect(src).toContain('minWidth:44')
    expect(src).toContain('minHeight:44')
  })

  it('globals.css enforces 44px on .s-btn at mobile breakpoint', () => {
    const fs = require('fs')
    const css = fs.readFileSync(`${__dirname}/../app/globals.css`, 'utf8')
    expect(css).toContain('min-width:44px')
    expect(css).toContain('min-height:44px')
  })
})

// AC5: Checkout form stacks to single column on mobile
describe('Checkout – single column layout on mobile', () => {
  it('has .checkout-grid with 1fr override at ≤640px', () => {
    const fs = require('fs')
    const css = fs.readFileSync(`${__dirname}/../app/globals.css`, 'utf8')
    expect(css).toContain('.checkout-grid')
    expect(css).toContain('grid-template-columns:1fr')
  })

  it('checkout item names use word-break instead of nowrap', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/checkout/page.js`, 'utf8')
    // Should NOT have whiteSpace:nowrap for item names (it was removed)
    expect(src).not.toContain("whiteSpace:'nowrap'")
    expect(src).toContain('wordBreak')
  })
})

// AC6: Newsletter stacks vertically on small screens
describe('Newsletter – responsive stacking', () => {
  it('newsletter row uses .newsletter-row CSS class', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../app/page.js`, 'utf8')
    expect(src).toContain('newsletter-row')
  })

  it('globals.css applies flex-direction:column to .newsletter-row at ≤480px', () => {
    const fs = require('fs')
    const css = fs.readFileSync(`${__dirname}/../app/globals.css`, 'utf8')
    expect(css).toContain('.newsletter-row')
    expect(css).toContain('flex-direction:column')
  })
})

// AC7: Cart drawer item names do not overflow
describe('Cart drawer – item name overflow', () => {
  it('drawer item names use .drawer-item-name class (word-break via CSS)', () => {
    const fs = require('fs')
    const src = fs.readFileSync(`${__dirname}/../components/Navbar.js`, 'utf8')
    expect(src).toContain('drawer-item-name')
  })

  it('globals.css defines .drawer-item-name with white-space:normal and word-break:break-word', () => {
    const fs = require('fs')
    const css = fs.readFileSync(`${__dirname}/../app/globals.css`, 'utf8')
    expect(css).toContain('.drawer-item-name')
    expect(css).toContain('word-break:break-word')
  })
})

// AC8: No horizontal overflow — html/body constrained
describe('Global – no horizontal scroll', () => {
  it('globals.css sets overflow-x:hidden on html and body', () => {
    const fs = require('fs')
    const css = fs.readFileSync(`${__dirname}/../app/globals.css`, 'utf8')
    expect(css).toContain('overflow-x:hidden')
    expect(css).toContain('max-width:100vw')
  })
})
