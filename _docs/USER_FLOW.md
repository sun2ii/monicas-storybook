# User Flow - Monica's Storybook

## Product Thesis

Modern technology treats memories as replaceable data, but the most important photos and videos in people's lives are irreplaceable. Users defensively spread memories across multiple cloud services (Dropbox, Google, Amazon, devices), which creates fragmentation, anxiety, and fragility. Existing tools optimize for storage and scale, not emotional safety or human decision-making.

Monica's Storybook does NOT replace storage providers and does NOT delete files.
It is a gentle, non-destructive layer that references existing storage, reduces fragility, and helps users safely turn memories into something tangible (albums / storybooks).

## Flow Explanation

### Entry & Trust Building
- User connects their storage (Dropbox, Google Photos, etc.)
- App shows all photos in one unified view
- Trust established upfront: we reference, never move or delete

### Clarity & Decision Layer
- **Browse:** Filter photos by date, tags, and location
- **Find duplicates:** See them side-by-side, choose which to keep visible
- **Organize:** Create albums with drag-and-drop

### Meaning Creation
- Transform albums into printable storybook layouts
- Preview and adjust pages until satisfied
- Order physical book or export PDF
## System Flow Diagram

**Legend:**
- 🟢 **Green** - User actions (what the user does)
- 🔵 **Blue** - System operations (what you need to build)
- 🟠 **Orange** - Decision points (user chooses)
- 🟣 **Purple** - Completion (goal achieved)

```mermaid
flowchart TD
    Start([New User]) --> Onboard[Welcome: Your memories stay where they are<br/>We only reference, never move or delete]
    Onboard --> Connect{Connect Storage}
    Connect -->|Dropbox| DB[Dropbox photos]
    Connect -->|Google Photos| GP[Google photos]
    Connect -->|Multiple sources| Multi[All sources]
    DB --> View[View all photos in one place]
    GP --> View
    Multi --> View
    View --> Clarity{What do you need?}
    Clarity -->|Just browse| Browse[Safe browsing<br/>Filter by date, tags, location]
    Clarity -->|Find duplicates| Dup[See duplicates side-by-side<br/>Choose which to keep visible]
    Clarity -->|Organize| Org[Create albums<br/>Drag and drop]
    Browse --> Return{Done or continue?}
    Dup --> DupChoice[User decides:</br> keep, hide, or ignore]
    Org --> AlbumCreated[Album saved]
    DupChoice --> Return
    AlbumCreated --> Return
    Return -->|Create storybook| Transform
    Transform[Transform album to storybook<br/>Add captions, arrange pages]
    Transform --> Preview[Preview print layout]
    Preview --> Decide{Ready?}
    Decide -->|Not yet| Transform
    Decide -->|Yes| Output
    Output[Order physical book or export PDF]
    Output --> Done([Complete])

    classDef userAction fill:#1e4d2b,stroke:#50c878,stroke-width:3px,color:#ffffff
    classDef systemOp fill:#1e3a5f,stroke:#4a90e2,stroke-width:3px,color:#ffffff
    classDef decision fill:#5c3d00,stroke:#ffa500,stroke-width:3px,color:#ffffff
    classDef completion fill:#3d1e5c,stroke:#9b59b6,stroke-width:3px,color:#ffffff

    class Start,Browse,Org,DupChoice,Transform,Output userAction
    class Onboard,View,Dup,AlbumCreated,Preview systemOp
    class Connect,Clarity,Return,Decide decision
    class DB,GP,Multi,Done completion
```
