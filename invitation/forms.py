from django import forms

from .models import RSVP


class AdminGuestForm(forms.ModelForm):
    class Meta:
        model = RSVP
        fields = ('name', 'phone', 'email', 'attending', 'guest_count', 'guest_names', 'notes')
        labels = {
            'name': 'Guest full name',
            'phone': 'Phone / WhatsApp',
            'email': 'Email address (optional)',
            'attending': 'Attendance status',
            'guest_count': 'Number of guests',
            'guest_names': 'Additional guest names (optional)',
            'notes': 'Notes (optional)',
        }
        widgets = {
            'name': forms.TextInput(attrs={'class': 'dash-form-input', 'autocomplete': 'name'}),
            'phone': forms.TextInput(attrs={'class': 'dash-form-input', 'type': 'tel', 'autocomplete': 'tel'}),
            'email': forms.EmailInput(attrs={'class': 'dash-form-input', 'autocomplete': 'email'}),
            'attending': forms.Select(attrs={'class': 'dash-form-input'}),
            'guest_count': forms.NumberInput(attrs={'class': 'dash-form-input', 'min': '0'}),
            'guest_names': forms.Textarea(attrs={'class': 'dash-form-input', 'rows': 2}),
            'notes': forms.Textarea(attrs={'class': 'dash-form-input', 'rows': 2}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['attending'].initial = 'yes'
        self.fields['guest_count'].initial = 1
        self.fields['guest_count'].min_value = 0
        self.fields['guest_count'].label = 'Number of guests'
