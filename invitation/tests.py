from django.test import TestCase, Client
from django.urls import reverse
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
        self.assertContains(response, "Munondo eleven")

    def test_dashboard_page(self):
        response = self.client.get(reverse('invitation:dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Rutendo &amp; Farai Sithole")
        self.assertContains(response, "Wedding Dashboard")

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
        self.assertTrue(RSVP.objects.filter(name="Simba Chiweshe").exists())

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
