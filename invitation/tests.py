from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from invitation.models import RSVP, GuestPhoto


class WeddingAppTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.rsvp1 = RSVP.objects.create(
            name="Rutendo & Farai Sithole",
            phone="+263771112233",
            email="rutendo@example.com",
            attending="yes",
            guest_count=2,
            guest_names="Farai Sithole",

            notes="Warmest congratulations to Terrence and Lina!"
        )

    def test_index_page(self):
        response = self.client.get(reverse('invitation:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Terrence Masimba Svosve")
        self.assertContains(response, "Lina Yeukaishe Mutsopotsi")
        self.assertContains(response, "Munondo Eleven")
        self.assertNotContains(response, 'onclick="window.handleRsvpSubmit')

    def test_dashboard_page(self):
        admin_user = get_user_model().objects.create_user(
            username="wedding-admin",
            password="test-password",
            is_staff=True,
        )
        self.client.force_login(admin_user)
        response = self.client.get(reverse('invitation:dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Rutendo &amp; Farai Sithole")
        self.assertContains(response, "Wedding Dashboard")
        self.assertContains(response, "Add Guest to Directory")
        self.assertContains(response, 'id="openAddGuestDialog"')
        self.assertContains(response, 'id="addGuestDialog"')
        self.assertContains(response, "@media (max-width: 760px)")

    def test_dashboard_rejects_non_staff_users(self):
        dashboard_url = reverse('invitation:dashboard')
        self.assertEqual(self.client.get(dashboard_url).status_code, 302)

        regular_user = get_user_model().objects.create_user(
            username="wedding-guest",
            password="test-password",
        )
        self.client.force_login(regular_user)
        self.assertEqual(self.client.get(dashboard_url).status_code, 302)

    def test_staff_can_add_guest_from_dashboard(self):
        admin_user = get_user_model().objects.create_user(
            username="guest-entry-admin",
            password="test-password",
            is_staff=True,
        )
        self.client.force_login(admin_user)

        response = self.client.post(reverse('invitation:dashboard'), {
            'name': 'Tariro Moyo',
            'phone': '+263771234567',
            'email': 'tariro@example.com',
            'attending': 'yes',
            'guest_count': 2,
            'guest_names': 'Tendai Moyo',
            'notes': 'Added by the organizer',
        })

        self.assertRedirects(response, reverse('invitation:dashboard'))
        guest = RSVP.objects.get(name='Tariro Moyo')
        self.assertEqual(guest.phone, '+263771234567')
        self.assertEqual(guest.email, 'tariro@example.com')
        self.assertEqual(guest.attending, 'yes')
        self.assertEqual(guest.guest_count, 2)
        self.assertEqual(guest.guest_names, 'Tendai Moyo')

    def test_dashboard_guest_form_shows_validation_errors(self):
        admin_user = get_user_model().objects.create_user(
            username="guest-validation-admin",
            password="test-password",
            is_staff=True,
        )
        self.client.force_login(admin_user)

        response = self.client.post(reverse('invitation:dashboard'), {
            'name': 'Tariro Moyo',
            'phone': '+263771234567',
            'email': 'not-an-email',
            'attending': 'yes',
            'guest_count': 1,
        })

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Enter a valid email address.')
        self.assertRegex(response.content.decode(), r'<dialog[^>]*\bopen>')
        self.assertFalse(RSVP.objects.filter(name='Tariro Moyo').exists())

    def test_non_staff_cannot_add_guest_from_dashboard(self):
        response = self.client.post(reverse('invitation:dashboard'), {
            'name': 'Unauthorized Guest',
            'phone': '0770000000',
            'attending': 'yes',
            'guest_count': 1,
        })

        self.assertEqual(response.status_code, 302)
        self.assertFalse(RSVP.objects.filter(name='Unauthorized Guest').exists())

    def test_api_rsvps(self):
        response = self.client.get(reverse('invitation:api_rsvps'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertGreaterEqual(len(data['rsvps']), 1)
        self.assertIn('stats', data)
        self.assertGreaterEqual(data['stats']['total_responses'], 1)

    def test_api_rsvp_submit(self):
        payload = {
            "name": "Simba Chiweshe",
            "phone": "+263779998888",
            "email": "simba@example.com",
            "attending": "yes",
            "guest_count": 1,
            "guest_names": "",

            "notes": "Looking forward to celebrating with you both!"
        }
        response = self.client.post(
            reverse('invitation:api_rsvp'),
            data=payload,
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertTrue(res_data['success'])
        self.assertEqual(RSVP.objects.filter(name="Simba Chiweshe").count(), 1)

    def test_api_export_csv(self):
        response = self.client.get(reverse('invitation:api_export_csv'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        content = response.content.decode('utf-8')
        self.assertIn("Rutendo & Farai Sithole", content)

    def test_api_rsvp_delete(self):
        test_rsvp = RSVP.objects.create(
            name="Temporary Guest",
            phone="0770000000",
            attending="no",
            guest_count=0
        )
        delete_url = reverse('invitation:api_rsvp_detail', kwargs={'rsvp_id': test_rsvp.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(RSVP.objects.filter(id=test_rsvp.id).exists())
