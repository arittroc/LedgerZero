graph TD
    A[User Logs In] --> B{Fetch Data}
    B -->|Query DB| C[Load Outstanding Invoices]
    B -->|API/Mock| D[Load Live Bank Feed]
    
    C --> E[ClearMatch Algorithm]
    D --> E
    
    E -->|Exact Amount & Date Match| F[High Confidence Match]
    E -->|No Match| G[Unmatched Item]
    
    F --> H[UI: Highlight Green & Bridge UI]
    G --> I[UI: Standard Grey Card]
    
    H --> J[User Reviews Dashboard]
    I --> J
    
    J --> K{Action: Click 'Approve All'}
    K --> L[Update Invoice Status to 'Paid']
    K --> M[Clear Reconciled Items from UI]
    
    L --> N[Success Notification]
    M --> N