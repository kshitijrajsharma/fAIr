import { TUserProfilePageContent } from "@/types";

export const USER_PROFILE_PAGE_CONTENT: TUserProfilePageContent = {
    overview: {
        pageTitle: 'My Profile',
        dateJoinedPrefix: 'Joined',
        profileCompletionSuffix: 'Complete',
        profileCompletionCTA: 'Complete your profile',
        trainingsSectionTitle: 'My Trainings',
        statistics: {
            modelsCreated: 'Models Created',
            acceptedFeaturesTitle: 'Accepted Features',
            datasets: 'Datasets',
            feedbacks: 'Feedbacks'
        }
    },
    models: {
        pageTitle: 'My Models',
        sectionTitle: 'My Models',
        createNewButtonText: 'Create New'
    },
    datasets: {
        pageTitle: 'My Datasets',
        sectionTitle: 'My Datasets',
    },
    settings: {
        pageTitle: 'Profile sSettings',
        form: {
            email: {
                sectionHeading: 'Enter email address',
                tooltip: 'Enter email address',
                placeholder: 'Enter email address',
                title: 'Email'
            }
        },
        notifications: {
            sectionTitle: 'Notifications',
            sectionOne: {
                title: 'Email notifications',
                subSectionOne: {
                    title: 'Monthly Newsletter',
                    description: 'A short description about the newsletter'
                },
                subSectionTwo: {
                    title: 'Training Notification',
                    description: 'A short description about the newsletter'
                }
            },
            sectionTwo: {
                title: 'Web notifications',
                options: [
                    'When model is published',
                    'When other submit a training for your model',
                    'Failed Training'
                ]
            }
        },
        account: {
            sectionTitle: 'Account',
            sectionOne: {
                title: 'Delete Account',
                description: 'If you no longer want to use fAIr, request to delete your account.'
            },
            deleteButton: {
                text: 'Delete My Account',
                modal: {
                    title: 'Delete Account',
                    description: 'Are you sure you want to delete your account ?',
                    deleteButtonText: 'Delete',
                    cancelButtonText: 'Cancel'
                }

            }
        }
    }
};
