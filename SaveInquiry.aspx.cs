using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Linq;

public partial class SaveInquiry : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentType = "text/plain";

        if (Request.HttpMethod == "POST")
        {
            try
            {
                // Get and validate form data
                string firstName = GetFormValue("firstName");
                string lastName = GetFormValue("lastName");
                string email = GetFormValue("email");
                string country = GetFormValue("country");
                string state = GetFormValue("state");
                string city = GetFormValue("city");
                string phone = GetFormValue("phone");
                string contactMethod = GetFormValue("contactMethod");

                // Get selected products
                string videoProducts = GetCheckboxValues("videoProducts");
                string broadcastProducts = GetCheckboxValues("broadcastProducts");

                // Validate required fields
                if (string.IsNullOrWhiteSpace(firstName) ||
                    string.IsNullOrWhiteSpace(lastName) ||
                    string.IsNullOrWhiteSpace(email) ||
                    string.IsNullOrWhiteSpace(country) ||
                    string.IsNullOrWhiteSpace(city) ||
                    string.IsNullOrWhiteSpace(phone) ||
                    string.IsNullOrWhiteSpace(contactMethod))
                {
                    Response.Write("ERROR: All required fields must be filled");
                    return;
                }

                // Validate email format
                if (!IsValidEmail(email))
                {
                    Response.Write("ERROR: Invalid email format");
                    return;
                }

                // Validate phone format (remove formatting characters)
                string cleanPhone = Regex.Replace(phone, @"[^\d]", "");
                if (cleanPhone.Length < 10)
                {
                    Response.Write("ERROR: Phone number must be at least 10 digits");
                    return;
                }

                // Validate contact method
                string[] validMethods = { "phone_call", "email", "whatsapp" };
                if (!validMethods.Contains(contactMethod))
                {
                    Response.Write("ERROR: Invalid contact method");
                    return;
                }

                // Save to database
                string conString = ConfigurationManager.ConnectionStrings["dbCon"].ConnectionString;
                using (SqlConnection con = new SqlConnection(conString))
                {
                    string query = @"INSERT INTO DealershipInquiry
                                    (FirstName, LastName, Email, Country, State, City, Phone, 
                                     ContactMethod, VideoProducts, BroadcastProducts, SubmittedDate, Status)
                                    VALUES
                                    (@FirstName, @LastName, @Email, @Country, @State, @City, @Phone, 
                                     @ContactMethod, @VideoProducts, @BroadcastProducts, @SubmittedDate, @Status)";

                    SqlCommand cmd = new SqlCommand(query, con);
                    cmd.Parameters.AddWithValue("@FirstName", firstName);
                    cmd.Parameters.AddWithValue("@LastName", lastName);
                    cmd.Parameters.AddWithValue("@Email", email);
                    cmd.Parameters.AddWithValue("@Country", country);
                    cmd.Parameters.AddWithValue("@State", string.IsNullOrWhiteSpace(state) ? DBNull.Value : (object)state);
                    cmd.Parameters.AddWithValue("@City", city);
                    cmd.Parameters.AddWithValue("@Phone", phone);
                    cmd.Parameters.AddWithValue("@ContactMethod", contactMethod);
                    cmd.Parameters.AddWithValue("@VideoProducts", string.IsNullOrWhiteSpace(videoProducts) ? DBNull.Value : (object)videoProducts);
                    cmd.Parameters.AddWithValue("@BroadcastProducts", string.IsNullOrWhiteSpace(broadcastProducts) ? DBNull.Value : (object)broadcastProducts);
                    cmd.Parameters.AddWithValue("@SubmittedDate", DateTime.Now);
                    cmd.Parameters.AddWithValue("@Status", "Pending");

                    con.Open();
                    cmd.ExecuteNonQuery();
                    con.Close();
                }

                Response.Write("SUCCESS");
            }
            catch (SqlException sqlEx)
            {
                // Log the error (implement proper logging in production)
                System.Diagnostics.Debug.WriteLine("Database error: " + sqlEx.Message);
                Response.Write("ERROR: Database error occurred. Please try again later.");
            }
            catch (Exception ex)
            {
                // Log the error (implement proper logging in production)
                System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                Response.Write("ERROR: An unexpected error occurred. Please try again.");
            }
        }
        else
        {
            Response.Write("ERROR: Invalid request method");
        }
    }

    private string GetFormValue(string key)
    {
        string value = Request.Form[key];
        return value != null ? value.Trim() : string.Empty;
    }

    private string GetCheckboxValues(string name)
    {
        var values = Request.Form.GetValues(name);
        if (values != null && values.Length > 0)
        {
            return string.Join(", ", values);
        }
        return string.Empty;
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}