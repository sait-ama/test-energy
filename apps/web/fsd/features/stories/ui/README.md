## Structure

```tsx
const Component = () => {
    return (
        <StoriesRoot items={items}>
            <StoriesBackdrop>
                <YearSummaryStoriesBackdrop />
            </StoriesBackdrop>
            <StoriesItem>
                <StoriesItemContent id="anume">
                    <Anume />
                </StoriesItemContent>
                <StoriesItemContent id="cringe">
                    <Cringe />
                </StoriesItemContent>
            </StoriesItem>
            <StoriesOverlay>
                <MyFloatingItem className="top-4 left-md absolute" />
                <MyFloatingItem2 className="top-4 right-md absolute" />
            </StoriesOverlay>
        </StoriesRoot>
    );
};
```

## PlaybackControl

```tsx
//component inside <StoriesRoot/>
const Component = () => {
    const {next, prev, ...} = useStoriesPlayback();
    ...
};
```
