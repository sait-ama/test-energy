import { palette } from 'src/app/themes/darkTheme/palette.js';

export const components = {
    MuiAvatar: {
        styleOverrides: {
            root: {
                backgroundColor: palette.background.paper,
                color: palette.text.secondary,
            },
        },
    },
    MuiBackdrop: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(0, 7, 52, 0.2)',
                backdropFilter: 'blur(2px)',
                '&.MuiBackdrop-invisible': {
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(2px)',
                },
            },
        },
    },
    MuiFormControl: {
        defaultProps: {
            margin: 'dense',
        },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                padding: 0,
                height: 38,
                minHeight: 38,
                borderRadius: 6,
                transition: 'color .2s',
                '&.MuiButtonBase-root': {
                    minWidth: 'auto',
                    paddingLeft: 20,
                    paddingRight: 20,
                    marginRight: 4,
                },
                '&.Mui-selected, &.Mui-selected:hover': {
                    color: palette.primary.main,
                    zIndex: 5,
                },
                '&:hover': {
                    color: palette.primary.main,
                },
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:last-child td': {
                    border: 0,
                },
            },
        },
    },
    MuiTableCell: {
        styleOverrides: {
            root: {
                padding: '18px',
                '&.MuiTableCell-sizeSmall': {
                    padding: '13.5px',
                },
                '&.MuiTableCell-paddingNone': {
                    padding: '4.5px',
                },
            },
        },
    },
    MuiTabs: {
        styleOverrides: {
            root: {
                height: 38,
                minHeight: 38,
                overflow: 'visible',
            },
            scrollableX: {
                overflow: 'visible !important',
            },
        },
    },
    MuiTextField: {
        defaultProps: {
            variant: 'outlined',
        },
    },
    RaAppBar: {
        styleOverrides: {
            root: {
                color: '#fff',
                '& .RaAppBar-toolbar': {
                    backgroundColor: palette.background.main,
                    // "color": "#363D40",
                    // "backgroundImage": "linear-gradient(310deg, #fbcf33, #ce93d8)"
                },
            },
        },
    },
    RaMenuItemLink: {
        styleOverrides: {
            root: {
                padding: 10,
                paddingLeft: 16,
                marginLeft: 4,
                marginRight: 4,
                // borderLeft: '3px solid #000',
                '&:hover': {
                    borderRadius: 10,
                },
                '&.RaMenuItemLink-active': {
                    // borderLeft: '3px solid #90caf9',
                    borderRadius: 10,
                    backgroundColor: palette.background.paper,
                    // color: palette.secondary.main,
                    // "&:before": {
                    //     "content": "\"\"",
                    //     "position": "absolute",
                    //     "top": "0; right: 0; bottom: 0; left: 0",
                    //     "zIndex": "-1",
                    //     "margin": "-2px",
                    //     "borderRadius": "12px",
                    //     "background": "linear-gradient(310deg, #fbcf33, #ce93d8)"
                    // },
                },
            },
        },
    },
    RaEdit: {
        styleOverrides: {
            root: {
                '& .RaEdit-main': {
                    '& .MuiPaper-root': {
                        // border: '1px solid rgba(255, 255, 255, 0.12)',
                    },
                    margin: 6,
                    marginRight: 12,
                    marginTop: 16,
                },
            },
        },
    },
    RaShow: {
        styleOverrides: {
            root: {
                '& .RaShow-main': {
                    '& .MuiPaper-root': {
                        // border: '1px solid rgba(255, 255, 255, 0.12)',
                    },
                    margin: 6,
                    marginRight: 12,
                    marginTop: 16,
                },
            },
        },
    },
};
