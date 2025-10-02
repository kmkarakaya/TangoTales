# TangoTales Desktop Layout Structure

## Desktop View (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIXED HEADER                                 │
│  🎵 TangoTales              🔥 Popular | 🏠 Home | 📚 Browse    ☰   │
│  AI-Powered Encyclopedia                                             │
└─────────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────────┐
│              │                                                      │
│   SIDEBAR    │                  MAIN CONTENT                       │
│   (320px)    │                                                      │
│              │  ┌────────────────────────────────────────────┐    │
│ Browse A-Z   │  │            HERO SECTION                    │    │
│ ┌──────────┐ │  │  "Discover the Stories Behind Tango"       │    │
│ │ A B C D  │ │  │   Large descriptive subtitle               │    │
│ │ E F G H  │ │  └────────────────────────────────────────────┘    │
│ │ I J K L  │ │                                                      │
│ │ M N O P  │ │  ┌────────────────────────────────────────────┐    │
│ │ Q R S T  │ │  │         SEARCH BAR                         │    │
│ │ U V W X  │ │  │  🎵  [Search for a tango song...]    🔍   │    │
│ │ Y Z      │ │  │  💡 Try "La Cumparsita" or browse         │    │
│ └──────────┘ │  └────────────────────────────────────────────┘    │
│              │                                                      │
│ Quick        │  ┌────────────────────────────────────────────┐    │
│ Discover     │  │         SEARCH RESULTS                     │    │
│ ┌──────────┐ │  │  (Shows results or popular songs section)  │    │
│ │ 🔥 Popular│ │  │                                            │    │
│ │   Songs  │ │  │  - Song cards with title, explanation      │    │
│ └──────────┘ │  │  - Ratings, tags, sources                  │    │
│              │  │  - Hover effects                           │    │
│ About        │  └────────────────────────────────────────────┘    │
│ TangoTales   │                                                      │
│ ┌──────────┐ │  ┌────────────────────────────────────────────┐    │
│ │🎭 Explore │ │  │      HOW TANGOTALES WORKS                  │    │
│ │🤖 AI      │ │  │  ┌────────┐ ┌────────┐ ┌────────┐        │    │
│ │📚 Curated │ │  │  │   🔍   │ │   🤖   │ │   📚   │        │    │
│ │💡 Learn   │ │  │  │ Search │ │   AI   │ │  Learn │        │    │
│ └──────────┘ │  │  └────────┘ └────────┘ └────────┘        │    │
│              │  │  ┌────────┐ ┌────────┐ ┌────────┐        │    │
│              │  │  │   ⭐   │ │   🏷️   │ │   🎭   │        │    │
│              │  │  │  Rate  │ │  Tags  │ │Context │        │    │
│              │  │  └────────┘ └────────┘ └────────┘        │    │
│              │  └────────────────────────────────────────────┘    │
│              │                                                      │
│              │  ┌────────────────────────────────────────────┐    │
│              │  │       START YOUR TANGO JOURNEY             │    │
│              │  │  Descriptive text about the app            │    │
│              │  │  [🔥 Explore Popular] [🔍 Search Now]      │    │
│              │  └────────────────────────────────────────────┘    │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│                            FOOTER                                    │
│  🎵 TangoTales - Powered by AI, Inspired by Passion                 │
│  © 2025 TangoTales                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Tablet View (768px - 1023px)

```
┌─────────────────────────────────────────────────┐
│             FIXED HEADER                        │
│  🎵 TangoTales        🔥 Popular | 📚 | ☰      │
└─────────────────────────────────────────────────┘
│                                                 │
│            MAIN CONTENT (Full Width)            │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │       HERO SECTION                    │     │
│  │  "Discover Stories Behind Tango"      │     │
│  └───────────────────────────────────────┘     │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │     SEARCH BAR                        │     │
│  │  🎵 [Search tango song...]      🔍   │     │
│  └───────────────────────────────────────┘     │
│                                                 │
│  [Sidebar toggles as overlay when clicked]     │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │     SEARCH RESULTS                    │     │
│  │     (Stacked cards)                   │     │
│  └───────────────────────────────────────┘     │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐             │
│  │  Feature 1  │ │  Feature 2  │             │
│  └─────────────┘ └─────────────┘             │
│  ┌─────────────┐ ┌─────────────┐             │
│  │  Feature 3  │ │  Feature 4  │             │
│  └─────────────┘ └─────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Mobile View (<768px)

```
┌─────────────────────────┐
│    FIXED HEADER         │
│  🎵 TangoTales      ☰  │
└─────────────────────────┘
│                         │
│   MAIN CONTENT          │
│                         │
│  ┌───────────────────┐  │
│  │   HERO SECTION    │  │
│  │  "Discover Tango" │  │
│  │   Stories..."     │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   SEARCH BAR      │  │
│  │ 🎵 [Search...] 🔍 │  │
│  └───────────────────┘  │
│                         │
│  [Tap ☰ for sidebar]    │
│                         │
│  ┌───────────────────┐  │
│  │  SEARCH RESULTS   │  │
│  │  (Vertical stack) │  │
│  │                   │  │
│  │  Song Card 1      │  │
│  │  Song Card 2      │  │
│  │  Song Card 3      │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   Feature 1       │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │   Feature 2       │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │   Feature 3       │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │      CTA          │  │
│  │  [Explore Songs]  │  │
│  │  [Search Now]     │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
┌─────────────────────────┐
│       FOOTER            │
│  🎵 TangoTales          │
└─────────────────────────┘
```

## Key Features by Screen Size

### Desktop (≥1024px)
✅ Persistent sidebar navigation
✅ 3-column feature grid
✅ Wide search bar
✅ Spacious layout
✅ Hover effects active

### Tablet (768-1023px)
✅ Collapsible sidebar overlay
✅ 2-column feature grid
✅ Adjusted spacing
✅ Touch-friendly targets

### Mobile (<768px)
✅ Hamburger menu
✅ Single column layout
✅ Stacked cards
✅ Simplified navigation
✅ Optimized for touch

## Color Palette

- **Primary**: Yellow `#FFD700` (Golden accents)
- **Secondary**: Red `#A11729` (Tango red)
- **Background**: Tango background image with gradient overlay
- **Text**: White `#FFFFFF` with strong shadows
- **Glass Effects**: `rgba(0, 0, 0, 0.1-0.2)` with backdrop blur

## Interactive Elements

1. **Alphabet Buttons**: Click to filter by letter
2. **Popular Songs Button**: Load top 15 songs
3. **Search Bar**: Real-time search with debounce
4. **Feature Cards**: Hover for scale effect
5. **Sidebar Toggle**: Show/hide navigation
6. **CTA Buttons**: Primary and secondary actions
7. **Clear Search**: Reset results

## Performance Optimizations

- 300ms debounce on search input
- Result caching in useSearch hook
- Lazy calculation of responsive state
- Efficient re-renders with useCallback
- Backdrop blur with GPU acceleration
