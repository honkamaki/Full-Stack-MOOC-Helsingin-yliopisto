sequenceDiagram
    participant browser
    participant server
    
    Note over browser: User types "123" and clicks Save (Aug 9, 2025 01:30 AM)

  browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note\ncontent=123&date=2025-08-09T01:30
    activate server
    Note over server: Server saves the note and adds the timestamp
    server-->>browser: 302 Redirect /notes
    deactivate server

    Note right of browser: Browser follows the redirect

  browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/notes
    activate server
    server-->>browser: HTML document
    deactivate server

  browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.css
    activate server
    server-->>browser: CSS file
    deactivate server

  browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.js
    activate server
    server-->>browser: JavaScript file
    deactivate server

    Note right of browser: JavaScript starts and fetches the notes in JSON format

  browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/data.json
    activate server
    server-->>browser: [{ "content": "HTML is easy", "date": "2023-1-1" }, ..., { "content": "123", "date": "2025-8-9 01:30" }]
    deactivate server    

    Note right of browser: Browser executes the callback and renders the list including the new "123" note
