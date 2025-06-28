// Dynamic favicon utility for GitScriptor
export class DynamicFavicon {
  private static canvas: HTMLCanvasElement | null = null
  private static ctx: CanvasRenderingContext2D | null = null
  
  private static initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = 32
      this.canvas.height = 32
      this.ctx = this.canvas.getContext('2d')
    }
  }

  // Create GitScriptor icon (document with AI sparkle) with dynamic color
  private static createGitScriptorIcon(color: string = '#3fb950'): string {
    this.initCanvas()
    if (!this.ctx || !this.canvas) return ''

    // Clear canvas
    this.ctx.clearRect(0, 0, 32, 32)
    
    // Draw document/README icon
    this.ctx.fillStyle = color
    this.ctx.fillRect(8, 4, 14, 20) // Main document rectangle
    
    // Document fold corner
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(19, 4)
    this.ctx.lineTo(22, 7)
    this.ctx.lineTo(19, 7)
    this.ctx.closePath()
    this.ctx.fill()
    
    // Document lines (content)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.fillRect(10, 9, 8, 1)   // Title line
    this.ctx.fillRect(10, 12, 10, 1) // Content line 1
    this.ctx.fillRect(10, 15, 6, 1)  // Content line 2
    this.ctx.fillRect(10, 18, 9, 1)  // Content line 3
    
    // AI Sparkle/Star in corner
    this.ctx.fillStyle = '#ffd700' // Gold color for AI sparkle
    this.ctx.beginPath()
    // Create a 4-pointed star
    const centerX = 25, centerY = 8
    const outerRadius = 3, innerRadius = 1.5
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      if (i === 0) this.ctx.moveTo(x, y)
      else this.ctx.lineTo(x, y)
    }
    this.ctx.closePath()
    this.ctx.fill()
    
    return this.canvas.toDataURL()
  }

  // Set favicon with optional color and status
  static setFavicon(options: {
    color?: string
    status?: 'idle' | 'loading' | 'success' | 'error'
    showBadge?: boolean
    badgeColor?: string
  } = {}) {
    const { 
      color = '#3fb950', 
      status = 'idle',
      showBadge = false,
      badgeColor = '#ff4444'
    } = options

    this.initCanvas()
    if (!this.ctx || !this.canvas) return

    // Create base GitScriptor icon
    this.createGitScriptorIcon(color)
    
    // Add status indicator if needed
    if (status !== 'idle' || showBadge) {
      this.addStatusIndicator(status, badgeColor)
    }

    // Update favicon
    this.updateFaviconLink(this.canvas.toDataURL())
  }

  // Add status indicator (dot in corner)
  private static addStatusIndicator(status: string, badgeColor: string) {
    if (!this.ctx) return

    const statusColors = {
      loading: '#ffa500',
      success: '#28a745',
      error: '#dc3545',
      idle: '#6c757d'
    }

    const color = statusColors[status as keyof typeof statusColors] || badgeColor
    
    // Draw small circle in top-right corner
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(26, 6, 4, 0, 2 * Math.PI)
    this.ctx.fill()
    
    // Add white border
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.stroke()
  }

  // Update the actual favicon link in the document
  private static updateFaviconLink(dataUrl: string) {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]')
    if (existingFavicon) {
      existingFavicon.remove()
    }

    // Add new favicon
    const favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.href = dataUrl
    document.head.appendChild(favicon)
  }

  // Animate favicon for loading states
  static animateLoading() {
    const colors = ['#3fb950', '#2ea043', '#3fb950', '#1a7f37'] // Dark theme colors
    let index = 0
    
    const interval = setInterval(() => {
      this.setFavicon({ 
        color: colors[index % colors.length],
        status: 'loading'
      })
      index++
    }, 500)

    return () => clearInterval(interval)
  }

  // Reset to default
  static reset() {
    this.setFavicon({ color: '#3fb950', status: 'idle' }) // Use dark theme primary color
  }
}

// Theme-aware favicon colors
export const faviconColors = {
  light: {
    primary: '#238636',
    secondary: '#0969da',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107'
  },
  dark: {
    primary: '#3fb950',
    secondary: '#2f81f7',
    success: '#3fb950',
    error: '#f85149',
    warning: '#d29922'
  }
}
