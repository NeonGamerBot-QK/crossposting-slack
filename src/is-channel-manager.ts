import "dotenv/config";
export default async function getChannelManagers(channel: string) {
  const myHeaders = new Headers();
  myHeaders.append("Cookie", `d=${process.env.SLACK_USER_COOKIE}`);

  const formdata = new FormData();
  formdata.append("token", process.env.SLACK_BROWSER_TOKEN!);
  formdata.append("entity_id", channel);

  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  const request = await fetch(
    "https://slack.com/api/admin.roles.entity.listAssignments",
    requestOptions,
  );

  const json = await request.json();
  console.debug(json);
  if (!json.ok) return [];
  return json.role_assignments[0]?.users || [];
}
