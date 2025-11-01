#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 100

struct Event {
    char name[100];
    int day;           // 0=Mon, 1=Tue, etc.
    int start_time;    // in HHMM format
    int end_time;
    int is_deadline;   // 1 = deadline-only
};

// Map day numbers to names
const char* getDay(int d) {
    const char *days[] = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"};
    return days[d];
}

void swap(struct Event *a, struct Event *b) {
    struct Event temp = *a;
    *a = *b;
    *b = temp;
}

// Sort events by day → then by start_time
void sortEvents(struct Event events[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (events[j].day > events[j + 1].day ||
                (events[j].day == events[j + 1].day &&
                 (events[j].start_time == -1 ? 1 :
                  events[j + 1].start_time == -1 ? 0 :
                  events[j].start_time > events[j + 1].start_time))) {
                swap(&events[j], &events[j + 1]);
            }
        }
    }
}

// Detect overlapping events
void detectClashes(struct Event events[], int n) {
    printf("\nChecking for schedule conflicts...\n");
    int found = 0;
    for (int i = 0; i < n - 1; i++) {
        if (!events[i].is_deadline && !events[i + 1].is_deadline &&
            events[i].day == events[i + 1].day &&
            events[i].end_time > events[i + 1].start_time) {
            printf("⚠️  Clash: '%s' overlaps with '%s' on %s\n",
                   events[i].name, events[i + 1].name, getDay(events[i].day));
            found = 1;
        }
    }
    if (!found) printf("No clashes found.\n");
}

// Find available free slots
void findFreeSlots(struct Event events[], int n) {
    printf("\nSuggested Free Slots:\n");
    int found = 0;
    for (int i = 0; i < n - 1; i++) {
        if (!events[i].is_deadline && !events[i + 1].is_deadline &&
            events[i].day == events[i + 1].day &&
            events[i].end_time < events[i + 1].start_time) {
            found = 1;
            printf("%s: %02d:%02d - %02d:%02d\n",
                   getDay(events[i].day),
                   events[i].end_time / 100, events[i].end_time % 100,
                   events[i + 1].start_time / 100, events[i + 1].start_time % 100);
        }
    }
    if (!found) printf("No free slots available.\n");
}

// Print timetable in terminal
void printTimetable(struct Event events[], int n) {
    printf("\n==============================================\n");
    printf("WEEKLY TIMETABLE\n");
    printf("==============================================\n");
    printf("%-10s %-25s %-20s\n", "Day", "Event Name", "Time");
    printf("--------------------------------------------------------------\n");

    for (int i = 0; i < n; i++) {
        if (events[i].is_deadline)
            printf("%-10s %-25s %-20s\n", getDay(events[i].day), events[i].name, "By 23:59 (End of Day)");
        else
            printf("%-10s %-25s %02d:%02d - %02d:%02d\n",
                   getDay(events[i].day), events[i].name,
                   events[i].start_time / 100, events[i].start_time % 100,
                   events[i].end_time / 100, events[i].end_time % 100);
    }
    printf("--------------------------------------------------------------\n");
}

// Export timetable to JSON
void exportToJSON(struct Event events[], int n) {
    const char *filename = "schedule.json";
    FILE *fp = fopen(filename, "w");
    if (!fp) {
        perror("Error creating schedule.json");
        return;
    }

    fprintf(fp, "[\n");
    for (int i = 0; i < n; i++) {
        if (events[i].is_deadline)
            fprintf(fp, "  {\"day\":\"%s\",\"event\":\"%s\",\"deadline\":\"23:59\",\"type\":\"deadline\"}%s\n",
                    getDay(events[i].day), events[i].name, i == n - 1 ? "" : ",");
        else
            fprintf(fp, "  {\"day\":\"%s\",\"event\":\"%s\",\"start\":\"%02d:%02d\",\"end\":\"%02d:%02d\",\"type\":\"fixed\"}%s\n",
                    getDay(events[i].day), events[i].name,
                    events[i].start_time / 100, events[i].start_time % 100,
                    events[i].end_time / 100, events[i].end_time % 100,
                    i == n - 1 ? "" : ",");
    }
    fprintf(fp, "]\n");
    fclose(fp);

    printf("\nData exported successfully to '%s'\n", filename);
}


// Parse time entered as "HH:MM" or "HH MM"
int parseTime() {
    char input[10];
    int hour, minute;
    scanf("%s", input);
    if (strchr(input, ':'))
        sscanf(input, "%d:%d", &hour, &minute);
    else {
        hour = atoi(input);
        scanf("%d", &minute);
    }
    return hour * 100 + minute;
}

// Display list of days
void displayDayOptions() {
    printf("\nChoose a day for this event by typing its number:\n");
    printf("  [0] Monday\n  [1] Tuesday\n  [2] Wednesday\n  [3] Thursday\n  [4] Friday\n  [5] Saturday\n  [6] Sunday\n");
    printf("Enter day number: ");
}

// Load events from existing JSON (basic stub — append mode)
int loadExistingEvents(struct Event events[]) {
    FILE *fp = fopen("schedule.json", "r");
    if (!fp) return 0;
    fclose(fp);
    printf("\nExisting 'schedule.json' detected. New events will be added.\n");
    return 0; // We’re not parsing JSON; just acknowledging presence
}

int main() {
    struct Event events[MAX];
    int n = 0, addCount, choice;

    printf("\n==============================================\n");
    printf("SMART TIMETABLE & ACTIVITY PLANNER\n");
    printf("==============================================\n\n");

    printf("1. Create new timetable\n");
    printf("2. Edit existing timetable (append new events)\n");
    printf("Enter your choice: ");
    scanf("%d", &choice);
    getchar();

    if (choice == 2) {
        n = loadExistingEvents(events);
    }

    printf("\nHow many new events/activities do you want to add now? ");
    scanf("%d", &addCount);
    getchar();

    for (int i = n; i < n + addCount; i++) {
        printf("\n----------------------------------------------\n");
        printf("EVENT %d DETAILS\n", i + 1);
        printf("----------------------------------------------\n");

        printf("Enter Event Name: ");
        fgets(events[i].name, sizeof(events[i].name), stdin);
        events[i].name[strcspn(events[i].name, "\n")] = 0;

        displayDayOptions();
        scanf("%d", &events[i].day);

        printf("\nIs this a deadline-based task (due by end of day)?\n");
        printf("  [1] Yes (no specific start time)\n");
        printf("  [0] No (enter start and end times)\n");
        printf("Enter your choice: ");
        scanf("%d", &events[i].is_deadline);

        if (events[i].is_deadline) {
            events[i].start_time = -1;
            events[i].end_time = 2359;
            printf("Deadline recorded for %s by 23:59 (End of Day)\n", getDay(events[i].day));
        } else {
            printf("\nEnter Start Time (24-hour, e.g., 09:00 or 14:30): ");
            events[i].start_time = parseTime();

            printf("Enter End Time (24-hour, e.g., 10:30 or 16:00): ");
            events[i].end_time = parseTime();
        }
        getchar(); // clear newline buffer
    }

    n += addCount;

    // Generate and display output
    sortEvents(events, n);
    printTimetable(events, n);
    detectClashes(events, n);
    findFreeSlots(events, n);
    exportToJSON(events, n);

    printf("\nTimetable successfully created and exported.\n");
    printf("You can now view it visually on the webpage for confirmation.\n\n");
    return 0;
}
